import { apiClient } from './apiClient';

export const profileService = {
  getProfile() {
    return apiClient.get('/profile');
  },

  updateProfile(payload) {
    return apiClient.put('/profile', payload);
  }
};
