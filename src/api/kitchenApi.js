import axiosClient from './axiosClient';

export const kitchenApi = {
  getQueue: () => axiosClient.get('/kitchen/queue'),
  getDisplay: () => axiosClient.get('/kitchen/display'),
};
