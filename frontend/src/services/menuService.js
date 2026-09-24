import { apiClient } from './apiClient';
export const menuService = {
  listPublic() { return apiClient.get('/menu-items/public'); },
  list() { return apiClient.get('/menu-items'); },
  categories() { return apiClient.get('/menu-items/categories'); },
  createCategory(payload) { return apiClient.post('/menu-items/categories', payload); },
  updateCategory(id, payload) { return apiClient.put(`/menu-items/categories/${id}`, payload); },
  removeCategory(id) { return apiClient.request(`/menu-items/categories/${id}`, { method: 'DELETE' }); },
  create(payload) { return apiClient.post('/menu-items', payload); },
  update(id, payload) { return apiClient.put(`/menu-items/${id}`, payload); },
  remove(id) { return apiClient.request(`/menu-items/${id}`, { method: 'DELETE' }); },
  uploadMedia(id, formData) { return apiClient.post(`/menu-items/${id}/media`, formData); }
};