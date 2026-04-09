import axios from 'axios';

// Thay vì gọi trực tiếp sang cỗng 8081 (auth) hay 8082 (user),
// ta sẽ gọi qua API GATEWAY ở cổng 8080!
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Trỏ thẳng vào Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Trước khi gửi request đi
axiosClient.interceptors.request.use((config) => {
  // Lấy token từ localStorage (sau khi login xong)
  const token = localStorage.getItem('access_token');
  if (token) {
    // Nhét token vào Header Authorization để báo danh với BE
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor: Sau khi nhận response từ BE về
axiosClient.interceptors.response.use((response) => {
  // Nếu request thành công, trả về data luôn cho gọn
  if (response && response.data) {
    return response.data;
  }
  return response;
}, (error) => {
  // Xử lý lỗi tập trung ở đây (VD: Token hết hạn -> Bắt đăng nhập lại)
  if (error.response && error.response.status === 401) {
    console.error("Hết hạn Token hoặc chưa đăng nhập!");
    // Có thể tự động xóa token và đá về trang login:
    // localStorage.removeItem('access_token');
    // window.location.href = '/';
  }
  return Promise.reject(error);
});

export default axiosClient;
