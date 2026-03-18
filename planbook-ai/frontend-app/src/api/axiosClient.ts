 import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8081/api/auth', // Tạm thời trỏ thẳng vào auth-service
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để đính kèm Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
