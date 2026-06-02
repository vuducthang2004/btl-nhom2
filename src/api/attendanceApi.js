import axiosClient from './axiosClient';

export const attendanceApi = {
  checkIn: () => axiosClient.post('/attendance/check-in'),
  checkOut: () => axiosClient.post('/attendance/check-out'),
  getSummary: (params) => axiosClient.get('/attendance/summary', { params }),
  getLogs: (params) => axiosClient.get('/attendance', { params }),
  overrideAttendance: (data) => axiosClient.post('/attendance/override', data)
};
