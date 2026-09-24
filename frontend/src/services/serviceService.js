import { apiClient } from './apiClient';

export const serviceService = {
  listPublic() { return apiClient.get('/services/public'); },
  list() { return apiClient.get('/services'); },
  create(payload) { return apiClient.post('/services', payload); },
  update(id, payload) { return apiClient.put(`/services/${id}`, payload); },
  remove(id) { return apiClient.request(`/services/${id}`, { method: 'DELETE' }); },
  uploadMedia(id, formData) { return apiClient.post(`/services/${id}/media`, formData); }
};
