import axiosClient from './axiosClient';

export const reportApi = {
  getDashboardOverview: () => axiosClient.get('/reports/dashboard'),
  getRevenueSummary: (params) => axiosClient.get('/reports/revenue/summary', { params }),
  getTopSelling: (params) => axiosClient.get('/reports/top-selling', { params }),
  getCategoryPerformance: (params) => axiosClient.get('/reports/category-performance', { params })
};