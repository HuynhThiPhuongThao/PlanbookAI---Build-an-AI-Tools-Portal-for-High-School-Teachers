import axiosClient from './axiosClient';

export const authApi = {
  login: (data) => {
    return axiosClient.post('/login', data);
  },
  register: (data) => {
    return axiosClient.post('/register', data);
  },
  changePassword: (data) => {
    return axiosClient.post('/change-password', data);
  }
};
