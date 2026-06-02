import axiosClient from './axiosClient';

export const paymentApi = {
  processPayment: (data) => axiosClient.post('/payments', data),
  getPaymentByOrderId: (orderId) => axiosClient.get(`/payments/${orderId}`),
};
