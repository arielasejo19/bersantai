import { apiClient } from './apiClient';
import { supabase } from './supabaseClient';

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

  async startSocialOAuth(provider, redirectTo) {
    if (!supabase) throw new Error('Social login is not configured.');
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw error;
  },

  exchangeSocialToken(accessToken) {
    return apiClient.post('/auth/social/exchange', { accessToken });
  },

  async socialLogout() {
    if (supabase) await supabase.auth.signOut();
  }
};
