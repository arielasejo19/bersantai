import { apiClient } from './apiClient';

export const villaService = {
  list() { return apiClient.get('/villas'); },
  listPublic() { return apiClient.get('/villas/public'); },
  availability(params) { return apiClient.get(`/villas/availability?${new URLSearchParams(params)}`); },
  listPublicTypes() { return apiClient.get('/villa-types/public'); },
  book(payload) { return apiClient.post('/villas/bookings', payload); },
  create(payload) { return apiClient.post('/villas', payload); },
  update(id, payload) { return apiClient.put(`/villas/${id}`, payload); },
  reservations(id) { return apiClient.get(`/villas/${id}/reservations`); },
  allReservations() { return apiClient.get('/villas/reservations'); },
  updateReservation(villaId, reservationId, status) { return apiClient.request(`/villas/${villaId}/reservations/${reservationId}/status`, { method: 'PATCH', body: { status } }); }
  ,assignReservation(reservationId, villaId) { return apiClient.request(`/villas/reservations/${reservationId}/assign`, { method: 'PATCH', body: { villaId: Number(villaId) } }); }
  ,listAccounts() { return apiClient.get('/villas/accounts'); }
  ,inviteStaff(payload) { return apiClient.post('/villas/staff', payload); }
  ,getConfig() { return apiClient.get('/villas/config'); }
  ,updateConfig(payload) { return apiClient.request('/villas/config', { method: 'PATCH', body: payload }); }
  ,listTypes() { return apiClient.get('/villa-types'); }
  ,createType(payload) { return apiClient.post('/villa-types', payload); }
  ,updateType(id, payload) { return apiClient.put(`/villa-types/${id}`, payload); }
  ,removeType(id) { return apiClient.request(`/villa-types/${id}`, { method: 'DELETE' }); }
  ,getPublicConfig() { return apiClient.get('/villas/config/public'); }
};