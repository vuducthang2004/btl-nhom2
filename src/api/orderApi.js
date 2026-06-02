import axiosClient from './axiosClient';

export const orderApi = {
  updateOrderStatus: (id, status) => axiosClient.patch(`/orders/${id}/status`, { status }),
};
