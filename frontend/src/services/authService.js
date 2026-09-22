import { apiClient } from './apiClient';

export const authService = {
  register(payload) {
    return apiClient.post('/auth/register', payload);
  },

  login(payload) {
    return apiClient.post('/auth/login', payload);
  },

  me() {
    return apiClient.get('/auth/me');
  },

  logout() {
    return apiClient.post('/auth/logout');
  },

  sendBookingVerification(email) {
    return apiClient.post('/booking-verification/send', { email });
  },

  verifyBookingEmail(payload) {
    return apiClient.post('/booking-verification/verify', payload);
  },

  social(payload) {
    return apiClient.post('/auth/social', payload);
  }
};
