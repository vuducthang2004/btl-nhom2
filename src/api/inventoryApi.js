import axiosClient from './axiosClient';

export const inventoryApi = {
  getIngredients: () => axiosClient.get('/inventory/ingredients'),
  getIngredientById: (id) => axiosClient.get(`/inventory/ingredients/${id}`),
  createIngredient: (data) => axiosClient.post('/inventory/ingredients', data),
  updateIngredient: (id, data) => axiosClient.put(`/inventory/ingredients/${id}`, data),
  toggleActive: (id, data) => axiosClient.patch(`/inventory/ingredients/${id}/active`, data),
  updateStock: (id, data) => axiosClient.patch(`/inventory/ingredients/${id}/stock`, data),
  getAlerts: () => axiosClient.get('/inventory/alerts'),

  getMenuItemIngredients: (itemId) => axiosClient.get(`/menu/items/${itemId}/ingredients`),
  setMenuItemIngredients: (itemId, data) => axiosClient.put(`/menu/items/${itemId}/ingredients`, data),
};