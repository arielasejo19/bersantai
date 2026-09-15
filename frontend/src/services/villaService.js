import { apiClient } from './apiClient';

export const villaService = {
  list() { return apiClient.get('/villas'); },
  listPublic() { return apiClient.get('/villas/public'); },
  book(payload) { return apiClient.post('/villas/bookings', payload); },
  create(payload) { return apiClient.post('/villas', payload); },
  update(id, payload) { return apiClient.put(`/villas/${id}`, payload); },
  reservations(id) { return apiClient.get(`/villas/${id}/reservations`); },
  updateReservation(villaId, reservationId, status) { return apiClient.request(`/villas/${villaId}/reservations/${reservationId}/status`, { method: 'PATCH', body: { status } }); }
  ,listAccounts() { return apiClient.get('/villas/accounts'); }
  ,inviteStaff(payload) { return apiClient.post('/villas/staff', payload); }
  ,getConfig() { return apiClient.get('/villas/config'); }
  ,updateConfig(payload) { return apiClient.request('/villas/config', { method: 'PATCH', body: payload }); }
};