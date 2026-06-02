import axiosClient from './axiosClient';

export const userApi = {
  getUsers: () => {
    return axiosClient.get('/users');
  },
  
  createUser: (userData) => {
    return axiosClient.post('/users', userData);
  },
  toggleActive: (id, data) => {
    return axiosClient.patch(`/users/${id}/active`, data);
  }
};