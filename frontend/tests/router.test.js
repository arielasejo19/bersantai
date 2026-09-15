import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../src/stores/authStore';

vi.mock('../src/services/authService', () => ({
  authService: {
    me: vi.fn().mockRejectedValue(new Error('Unauthorized')),
    logout: vi.fn()
  }
}));

vi.mock('../src/services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn()
  }
}));

describe('router guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
  });

  it('redirects unauthenticated users away from profile', async () => {
    const { default: router } = await import('../src/router');
    const store = useAuthStore();
    store.initialized = true;
    store.user = null;

    await router.push('/profile');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('login');
  });
});
