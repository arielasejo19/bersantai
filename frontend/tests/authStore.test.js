import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../src/stores/authStore';

vi.mock('../src/services/authService', () => ({
  authService: {
    me: vi.fn().mockResolvedValue({
      user: { id: '1', email: 'guest@example.com', displayName: 'Guest User' }
    }),
    login: vi.fn().mockResolvedValue({
      user: { id: '1', email: 'guest@example.com', displayName: 'Guest User' }
    }),
    logout: vi.fn().mockResolvedValue({ status: 'ok' }),
    register: vi.fn().mockResolvedValue({
      user: { id: '1', email: 'guest@example.com', displayName: 'Guest User' }
    })
  }
}));

vi.mock('../src/services/profileService', () => ({
  profileService: {
    getProfile: vi.fn().mockResolvedValue({
      profile: { userId: '1', email: 'guest@example.com', displayName: 'Guest User' }
    }),
    updateProfile: vi.fn().mockResolvedValue({
      profile: {
        userId: '1',
        email: 'guest@example.com',
        displayName: 'Updated User',
        bio: 'Hello',
        avatarUrl: null
      }
    })
  }
}));

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('restores the current user session', async () => {
    const store = useAuthStore();

    await store.restoreSession();

    expect(store.initialized).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user.email).toBe('guest@example.com');
  });

  it('clears user state on logout', async () => {
    const store = useAuthStore();
    await store.login({ email: 'guest@example.com', password: 'Password1' });

    await store.logout();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('updates profile and mirrors safe user profile fields', async () => {
    const store = useAuthStore();
    await store.login({ email: 'guest@example.com', password: 'Password1' });

    await store.updateProfile({
      displayName: 'Updated User',
      bio: 'Hello',
      avatarUrl: null
    });

    expect(store.profileSaved).toBe(true);
    expect(store.user.displayName).toBe('Updated User');
  });
});
