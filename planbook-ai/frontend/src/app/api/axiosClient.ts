import axios from 'axios';

// Gá»i qua API GATEWAY (port 8080)
// Gateway sáº½ route Ä‘áº¿n services (auth: 8081, user: 8082, ...)
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
    text.includes('khÃ³a') ||
    text.includes('khoa') ||
    text.includes('vÃ´ hiá»‡u') ||
    text.includes('vo hieu') ||
    text.includes('locked') ||
    text.includes('disabled')
  );
};

const saveAuthNotice = (notice: { type: 'locked' | 'expired' | 'maintenance'; title: string; message: string }) => {
  try {
    localStorage.setItem('auth_notice', JSON.stringify(notice));
  } catch {
    // Browser storage can fail in private mode; redirect still works.
  }
};

const redirectToLogin = (sourceError?: any) => {
  const message = readErrorMessage(sourceError?.response?.data);
  const normalizedMessage = String(message || '').toLowerCase();
  if (normalizedMessage.includes('bao tri') || normalizedMessage.includes('bảo trì')) {
    saveAuthNotice({
      type: 'maintenance',
      title: 'Hệ thống đang bảo trì',
      message: 'Hệ thống đang bảo trì. Giáo viên vui lòng quay lại sau.',
    });
    authStorage.clearTokens();
    window.location.href = '/';
    return;
  }
  const isLocked = isLockedAccountMessage(message);
  saveAuthNotice({
    type: isLocked ? 'locked' : 'expired',
    title: isLocked ? 'Tài khoản đã bị khóa' : 'Phiên đăng nhập đã hết hạn',
    message: isLocked
      ? 'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên để được mở lại.'
      : 'Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.',
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

// Interceptor: TrÆ°á»›c khi gá»­i request Ä‘i
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

  // Láº¥y token tá»« localStorage (sau khi login xong)
  const token = authStorage.getAccessToken();
  if (token) {
    // NhÃ©t token vÃ o Header Authorization Ä‘á»ƒ bÃ¡o danh vá»›i BE
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[Axios] Added Authorization header');
  }
  return config;
}, (error) => {
  console.error('[Axios Request] Error:', error);
  return Promise.reject(error);
});

// Interceptor: Sau khi nháº­n response tá»« BE vá»
axiosClient.interceptors.response.use((response) => {
  console.log('[Axios Response] Success:', response.status, response.data);
  // Náº¿u request thÃ nh cÃ´ng, tráº£ vá» data luÃ´n cho gá»n
  if (response && response.data) {
    return response.data;
  }
  return response;
}, async (error) => {
  // Xá»­ lÃ½ lá»—i táº­p trung á»Ÿ Ä‘Ã¢y
  console.error('[Axios Response] Error:');
  console.error('  Code:', error.code);
  console.error('  Status:', error.response?.status);
  console.error('  Message:', error.message);
  console.error('  Response:', error.response?.data);

  if (error.response && error.response.status === 401) {
    console.error("Token expired or unauthorized!");
    // Chá»‰ redirect náº¿u KHÃ”NG pháº£i Ä‘ang á»Ÿ trang login rá»“i
    // TrÃ¡nh vÃ²ng láº·p: login 401 â†’ redirect vá» / â†’ láº¡i gá»i â†’ 401 â†’ ...
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
