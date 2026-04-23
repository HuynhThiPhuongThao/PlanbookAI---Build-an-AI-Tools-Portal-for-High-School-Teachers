import axiosClient from './axiosClient';

// Gom tất cả những hàm liên quan đến ĐĂNG NHẬP, ĐĂNG KÝ vào một file này
export const authApi = {
  // 1. Đăng ký tài khoản mới (Mặc định là Teacher)
  register: (data: any) => {
    return axiosClient.post('/auth/register', data);
  },

  // 2. Đăng nhập lấy Token
  login: (data: { email: string; password: string }) => {
    // Gateway (8080) -> Auth Service (8081)
    return axiosClient.post('/auth/login', data);
  },

  // 3. Xin cấp lại Token mới (khi Access Token hết hạn)
  refreshToken: (refreshToken: string) => {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },

  // 4. Đăng xuất (Vô hiệu hóa token)
  logout: () => {
    return axiosClient.post('/auth/logout');
  },

  // 5. Lấy thông tin cơ bản của User đang đăng nhập dựa vào Token
  getMe: () => {
    return axiosClient.get('/auth/me');
  },

  // 6. Kiểm tra email đã đăng ký chưa (real-time validation)
  checkEmailExists: (email: string) => {
    return axiosClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
  },

  // 7. Đổi mật khẩu (cần đăng nhập, gửi kèm mật khẩu cũ để xác thực)
  changePassword: (data: { currentPassword: string; newPassword: string }) => {
    return axiosClient.post('/auth/change-password', data);
  },

  // 8. Admin tạo tài khoản nội bộ cho STAFF / MANAGER
  // Backend nhận role qua @RequestParam (query param), KHÔNG phải body!
  createInternalAccount: (data: {
    email: string;
    password: string;
    fullName: string;
    role: 'STAFF' | 'MANAGER';
  }) => {
    const { role, ...body } = data;
    return axiosClient.post('/auth/internal/create-account', body, {
      params: { role },  // ?role=STAFF hoặc ?role=MANAGER
    });
  },
};
