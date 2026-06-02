import axiosClient from './axiosClient';

export const orderApi = {
  createOrder: (data) => axiosClient.post('/orders', data),
  getOrders: (params) => axiosClient.get('/orders', { params }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.patch(`/orders/${id}/status`, { status }),
};
