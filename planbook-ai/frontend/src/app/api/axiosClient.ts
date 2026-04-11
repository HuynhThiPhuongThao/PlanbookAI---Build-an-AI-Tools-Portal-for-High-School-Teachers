import axios from 'axios';

// Gọi qua API GATEWAY (port 8080)
// Gateway sẽ route đến services (auth: 8081, user: 8082, ...)
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor: Trước khi gửi request đi
axiosClient.interceptors.request.use((config) => {
  console.log(`[Axios] Sending ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

  // Lấy token từ localStorage (sau khi login xong)
  const token = localStorage.getItem('access_token');
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
}, (error) => {
  // Xử lý lỗi tập trung ở đây
  console.error('[Axios Response] Error:');
  console.error('  Code:', error.code);
  console.error('  Status:', error.response?.status);
  console.error('  Message:', error.message);
  console.error('  Response:', error.response?.data);

  if (error.response && error.response.status === 401) {
    console.error("Token expired or unauthorized!");
    localStorage.removeItem('access_token');
    window.location.href = '/';
  }
  return Promise.reject(error);
});

export default axiosClient;
