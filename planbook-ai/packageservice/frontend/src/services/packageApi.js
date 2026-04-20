import axios from 'axios';

const API_URL = '/api';   // Proxy đã cấu hình trong vite.config.js

const packageApi = {
  // Lấy tất cả gói cước (dùng cho cả Teacher và Manager)
  getAllPackages: async () => {
    const response = await axios.get(`${API_URL}/packages`);
    return response.data;
  },

  // Teacher mua gói
  subscribePackage: async (packageId) => {
    const response = await axios.post(`${API_URL}/subscriptions`, { 
      packageId 
    });
    return response.data;
  },

  // Manager tạo gói mới
  createPackage: async (data) => {
    const response = await axios.post(`${API_URL}/packages`, data);
    return response.data;
  },

  // Manager cập nhật gói
  updatePackage: async (id, data) => {
    const response = await axios.put(`${API_URL}/packages/${id}`, data);
    return response.data;
  }
};

export default packageApi;