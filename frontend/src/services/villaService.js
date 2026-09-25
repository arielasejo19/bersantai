import { apiClient } from './apiClient';

export const villaService = {
  list() { return apiClient.get('/villas'); },
  get(id) { return apiClient.get(`/villas/${id}`); },
  listPublic() { return apiClient.get('/villas/public'); },
  getPublic(id) { return apiClient.get(`/villas/public/${id}`); },
  availability(params) { return apiClient.get(`/villas/availability?${new URLSearchParams(params)}`); },
  availabilityCalendar(params) { return apiClient.get(`/villas/availability-calendar?${new URLSearchParams(params)}`); },
  pricing(params) { return apiClient.get(`/villas/pricing?${new URLSearchParams(params)}`); },
  listPublicTypes() { return apiClient.get('/villa-types/public'); },
  book(payload) { return apiClient.post('/villas/bookings', payload); },
  create(payload) { return apiClient.post('/villas', payload); },
  update(id, payload) { return apiClient.put(`/villas/${id}`, payload); },
  archive(id) { return apiClient.request(`/villas/${id}/archive`, { method: 'PATCH' }); },
  uploadMedia(id, formData) { return apiClient.post(`/villas/${id}/media`, formData); },
  reservations(id) { return apiClient.get(`/villas/${id}/reservations`); },
  allReservations() { return apiClient.get('/villas/reservations'); },
  notifications(afterId) { const query = afterId == null ? '' : `?${new URLSearchParams({ afterId: String(afterId) })}`; return apiClient.get(`/villas/notifications${query}`); },
  reservation(id) { return apiClient.get(`/villas/reservations/${id}`); },
  assignableVillas(id) { return apiClient.get(`/villas/reservations/${id}/assignable-villas`); },
  confirmReservation(id) { return apiClient.post(`/villas/reservations/${id}/confirm`, {}); },
  checkInReservation(id, payload) { return apiClient.post(`/villas/reservations/${id}/check-in`, payload); },
  checkOutReservation(id, payload) { return apiClient.post(`/villas/reservations/${id}/check-out`, payload); },
  resendReservationEmail(id, type) { return apiClient.post(`/villas/reservations/${id}/emails/${type}/resend`, {}); },
  changeReservationState(id, status) { return apiClient.post(`/villas/reservations/${id}/state`, { status }); },
  listCalendarVillas() { return apiClient.get('/villas/calendar'); },
  reservationStatement(id) { return apiClient.get(`/villas/reservations/${id}/statement`); },
  addReservationCharge(id, payload) { return apiClient.post(`/villas/reservations/${id}/charges`, payload); },
  removeReservationCharge(id, chargeId) { return apiClient.request(`/villas/reservations/${id}/charges/${chargeId}`, { method: 'DELETE' }); },
  collectReservationPayment(id, payload) { return apiClient.post(`/villas/reservations/${id}/payments`, payload); },
  updateReservation(villaId, reservationId, status) { return apiClient.request(`/villas/${villaId}/reservations/${reservationId}/status`, { method: 'PATCH', body: { status } }); }
  ,assignReservation(reservationId, villaId) { return apiClient.request(`/villas/reservations/${reservationId}/assign`, { method: 'PATCH', body: { villaId: Number(villaId) } }); }
  ,listAccounts() { return apiClient.get('/villas/accounts'); }
  ,inviteStaff(payload) { return apiClient.post('/villas/staff', payload); }
  ,getConfig() { return apiClient.get('/villas/config'); }
  ,updateConfig(payload) { return apiClient.request('/villas/config', { method: 'PATCH', body: payload }); }
  ,uploadPublicMap(formData) { return apiClient.post('/villas/config/public-map', formData); }
  ,revenueSummary() { return apiClient.get('/villas/revenue'); }
  ,updateMapPosition(id, payload) { return apiClient.request(`/villas/${id}/map-position`, { method: 'PATCH', body: payload }); }
  ,listTypes() { return apiClient.get('/villa-types'); }
  ,createType(payload) { return apiClient.post('/villa-types', payload); }
  ,updateType(id, payload) { return apiClient.put(`/villa-types/${id}`, payload); }
  ,removeType(id) { return apiClient.request(`/villa-types/${id}`, { method: 'DELETE' }); }
  ,uploadTypeMedia(id, formData) { return apiClient.post(`/villa-types/${id}/media`, formData); }
  ,getPublicConfig() { return apiClient.get('/villas/config/public'); }
  ,listPricingRules() { return apiClient.get('/villas/pricing-rules'); }
  ,createPricingRule(payload) { return apiClient.post('/villas/pricing-rules', payload); }
  ,updatePricingRule(id, payload) { return apiClient.put(`/villas/pricing-rules/${id}`, payload); }
  ,removePricingRule(id) { return apiClient.request(`/villas/pricing-rules/${id}`, { method: 'DELETE' }); }
};
