import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

function messageFromError(error, fallback) {
  return error?.message || fallback;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    initialized: false,
    loading: false,
    error: null,
    profileSaved: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user)
  },
  actions: {
    async restoreSession() {
      if (this.initialized) return;

      this.loading = true;
      this.error = null;

      try {
        const result = await authService.me();
        this.user = result.user;
      } catch (_error) {
        this.user = null;
      } finally {
        this.initialized = true;
        this.loading = false;
      }
    },

    async register(payload) {
      this.loading = true;
      this.error = null;

      try {
        const result = await authService.register(payload);
        this.user = result.user;
        this.initialized = true;
        return result.user;
      } catch (error) {
        this.error = messageFromError(error, 'Registration failed');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(payload) {
      this.loading = true;
      this.error = null;

      try {
        const result = await authService.login(payload);
        this.user = result.user;
        this.initialized = true;
        return result.user;
      } catch (error) {
        this.error = messageFromError(error, 'Login failed');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async startSocialLogin(provider, redirectTo) {
      this.loading = true;
      this.error = null;

      try {
        await authService.startSocialOAuth(provider, redirectTo);
      } catch (error) {
        this.error = messageFromError(error, 'Social login failed');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async completeSocialLogin(accessToken) {
      this.loading = true;
      this.error = null;

      try {
        const result = await authService.exchangeSocialToken(accessToken);
        this.user = result.user;
        this.initialized = true;
        return result.user;
      } catch (error) {
        this.error = messageFromError(error, 'Social login could not be completed');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      this.error = null;

      try {
        await authService.logout();
        if (authService.socialLogout) {
          try { await authService.socialLogout(); } catch { }
        }
      } finally {
        this.user = null;
        this.profile = null;
        this.initialized = true;
        this.loading = false;
      }
    },

    async loadProfile() {
      this.loading = true;
      this.error = null;
      this.profileSaved = false;

      try {
        const result = await profileService.getProfile();
        this.profile = result.profile;
        return result.profile;
      } catch (error) {
        this.error = messageFromError(error, 'Profile could not be loaded');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(payload) {
      this.loading = true;
      this.error = null;
      this.profileSaved = false;

      try {
        const result = await profileService.updateProfile(payload);
        this.profile = result.profile;
        this.user = {
          ...this.user,
          displayName: result.profile.displayName,
          bio: result.profile.bio,
          avatarUrl: result.profile.avatarUrl
        };
        this.profileSaved = true;
        return result.profile;
      } catch (error) {
        this.error = messageFromError(error, 'Profile could not be saved');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
