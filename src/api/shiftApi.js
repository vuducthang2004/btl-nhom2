import axiosClient from './axiosClient';

export const shiftApi = {
  getShifts: () => axiosClient.get('/shifts'),
  createShift: (data) => axiosClient.post('/shifts', data),
  updateShift: (id, data) => axiosClient.put(`/shifts/${id}`, data),
  toggleActive: (id) => axiosClient.patch(`/shifts/${id}/active`),
  getAssignments: (params) => axiosClient.get('/shifts/assignments', { params }),
  createAssignment: (data) => axiosClient.post('/shifts/assignments', data)
};
