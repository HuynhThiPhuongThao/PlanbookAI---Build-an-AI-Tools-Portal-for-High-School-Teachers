import axios from 'axios';

const API_URL = 'http://localhost:8082/api/users';

const userApi = {
  // Lấy thông tin profile của chính mình
  getMe: async () => {
    const token = localStorage.getItem('accessToken');
    return await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Cập nhật thông tin profile của chính mình
  updateMe: async (userData) => {
    const token = localStorage.getItem('accessToken');
    return await axios.put(`${API_URL}/me`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // (Optional) Admin lấy danh sách user
  getAll: async () => {
    const token = localStorage.getItem('accessToken');
    return await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // ===== ADMIN APIs =====

  // Admin: lấy danh sách tất cả user
  getAllUsers: async () => {
    const token = localStorage.getItem('accessToken');
    return await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Admin: tạo user mới với role cụ thể
  createUser: async (data) => {
    const token = localStorage.getItem('accessToken');
    return await axios.post(`${API_URL}/admin/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Admin: đổi role của user
  changeRole: async (userId, role) => {
    const token = localStorage.getItem('accessToken');
    return await axios.put(`${API_URL}/admin/${userId}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Admin: khóa/mở tài khoản
  toggleStatus: async (userId, isActive) => {
    const token = localStorage.getItem('accessToken');
    const action = isActive ? 'activate' : 'deactivate';
    return await axios.put(`${API_URL}/${userId}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Upload ảnh đại diện: gửi multipart/form-data
  uploadAvatar: async (file) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`${API_URL}/me/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default userApi;
