import axios from 'axios';

// Gọi qua API GATEWAY (port 8080)
// Gateway sẽ route đến services (auth: 8081, user: 8082, ...)
const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  saveTokens: (tokens: { accessToken?: string | null; refreshToken?: string | null }) => {
    if (tokens.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else if (tokens.refreshToken === null) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const readErrorMessage = (payload: any) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  return payload.message || payload.error || payload.detail || '';
};

const isLockedAccountMessage = (message: string) => {
  const text = String(message || '').toLowerCase();
  return (
    text.includes('khóa') ||
    text.includes('khoa') ||
    text.includes('vô hiệu') ||
    text.includes('vo hieu') ||
    text.includes('locked') ||
    text.includes('disabled')
  );
};

const saveAuthNotice = (notice: { type: 'locked' | 'expired'; title: string; message: string }) => {
  try {
    localStorage.setItem('auth_notice', JSON.stringify(notice));
  } catch {
    // Browser storage can fail in private mode; redirect still works.
  }
};

const redirectToLogin = (sourceError?: any) => {
  const message = readErrorMessage(sourceError?.response?.data);
  const isLocked = isLockedAccountMessage(message);
  saveAuthNotice({
    type: isLocked ? 'locked' : 'expired',
    title: isLocked ? 'TÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³a' : 'PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n',
    message: isLocked
      ? 'TÃ i khoáº£n nÃ y Ä‘ang bá»‹ khÃ³a. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn Ä‘á»ƒ Ä‘Æ°á»£c má»Ÿ láº¡i.'
      : 'Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i Ä‘á»ƒ tiáº¿p tá»¥c sá»­ dá»¥ng há»‡ thá»‘ng.',
  });
  authStorage.clearTokens();
  window.location.href = '/';
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await axios.post('/api/auth/refresh', { refreshToken }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  const payload = response.data || {};
  const accessToken = payload.token || payload.accessToken;
  if (!accessToken) {
    throw new Error('Refresh response missing access token');
  }

  authStorage.saveTokens({
    accessToken,
    refreshToken: payload.refreshToken || refreshToken,
  });
  return accessToken;
};

const getFreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Interceptor: Trước khi gửi request đi
axiosClient.interceptors.request.use((config) => {
  console.log(`[Axios] Sending ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    const headers: any = config.headers;
    if (typeof headers.delete === 'function') {
      headers.delete('Content-Type');
      headers.delete('content-type');
    } else {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }
  }

  // Lấy token từ localStorage (sau khi login xong)
  const token = authStorage.getAccessToken();
  if (token) {
    // Nhét token vào Header Authorization để báo danh với BE
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[Axios] Added Authorization header');
  }
  return config;
}, (error) => {
  console.error('[Axios Request] Error:', error);
  return Promise.reject(error);
});

// Interceptor: Sau khi nhận response từ BE về
axiosClient.interceptors.response.use((response) => {
  console.log('[Axios Response] Success:', response.status, response.data);
  // Nếu request thành công, trả về data luôn cho gọn
  if (response && response.data) {
    return response.data;
  }
  return response;
}, async (error) => {
  // Xử lý lỗi tập trung ở đây
  console.error('[Axios Response] Error:');
  console.error('  Code:', error.code);
  console.error('  Status:', error.response?.status);
  console.error('  Message:', error.message);
  console.error('  Response:', error.response?.data);

  if (error.response && error.response.status === 401) {
    console.error("Token expired or unauthorized!");
    // Chỉ redirect nếu KHÔNG phải đang ở trang login rồi
    // Tránh vòng lặp: login 401 → redirect về / → lại gọi → 401 → ...
    const originalRequest: any = error.config || {};
    const requestUrl = String(originalRequest.url || '');
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isRefreshRequest = requestUrl.includes('/auth/refresh');
    const message = readErrorMessage(error.response?.data);

    if (!isLoginRequest && !isRefreshRequest && !isLockedAccountMessage(message) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await getFreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        redirectToLogin(refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (!isLoginRequest && !isRefreshRequest) {
      redirectToLogin(error);
    }
  }
  return Promise.reject(error);
});

export default axiosClient;
