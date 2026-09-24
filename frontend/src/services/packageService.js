import { apiClient } from './apiClient';
export const packageService = {
  listPublic() { return apiClient.get('/packages/public'); },
  list() { return apiClient.get('/packages'); },
  create(payload) { return apiClient.post('/packages', payload); },
  update(id, payload) { return apiClient.put(`/packages/${id}`, payload); },
  remove(id) { return apiClient.request(`/packages/${id}`, { method: 'DELETE' }); },
  uploadMedia(id, formData) { return apiClient.post(`/packages/${id}/media`, formData); }
};