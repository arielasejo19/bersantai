import { apiClient } from './apiClient';

export const profileService = {
  getProfile() {
    return apiClient.get('/profile');
  },

  getBookings() {
    return apiClient.get('/profile/bookings');
  },

  updateProfile(payload) {
    return apiClient.put('/profile', payload);
  }
};
