import axiosClient from './axiosClient';

// User-service API calls
export const userApi = {
  // 1. Lấy profile của user hiện tại (cần token)
  getMe: () => {
    return axiosClient.get('/users/me');
  },

  // 2. Cập nhật profile của user
  updateProfile: (data: any) => {
    return axiosClient.put('/users/me', data);
  },

  // 3. Lấy danh sách tất cả users (Admin only)
  getAllUsers: () => {
    return axiosClient.get('/users');
  },

  // 4. Xem profile của 1 user bất kỳ (Admin only)
  getUserById: (userId: number) => {
    return axiosClient.get(`/users/${userId}`);
  },

  // 5. Khóa tài khoản user (Admin only)
  deactivateUser: (userId: number) => {
    return axiosClient.put(`/users/${userId}/deactivate`);
  },

  // 6. Mở khóa tài khoản user (Admin only)
  activateUser: (userId: number) => {
    return axiosClient.put(`/users/${userId}/activate`);
  },
};
