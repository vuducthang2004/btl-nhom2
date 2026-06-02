import axiosClient from './axiosClient';

export const menuApi = {
  // --- Danh mục ---
  getCategories: () => axiosClient.get('/menu/categories'),
  createCategory: (data) => axiosClient.post('/menu/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/menu/categories/${id}`),

  // --- Món ăn ---
  getItems: (categoryId) => {
    const url = categoryId ? `/menu/items?categoryId=${categoryId}` : '/menu/items';
    return axiosClient.get(url);
  },
  getItemById: (id) => axiosClient.get(`/menu/items/${id}`),
  createItem: (data) => axiosClient.post('/menu/items', data),
  updateItem: (id, data) => axiosClient.put(`/menu/items/${id}`, data),
  toggleItemAvailability: (id) => axiosClient.patch(`/menu/items/${id}/availability`),

  // --- Topping ---
  getToppings: () => axiosClient.get('/menu/toppings'),
  createTopping: (data) => axiosClient.post('/menu/toppings', data),
  updateTopping: (id, data) => axiosClient.put(`/menu/toppings/${id}`, data),
};