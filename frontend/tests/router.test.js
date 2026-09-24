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

  it('sends authenticated management users from host login to the portal', async () => {
    const { default: router } = await import('../src/router');
    const store = useAuthStore();
    store.initialized = true;
    store.user = { role: 'host' };

    await router.push('/host/login');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('management');
  });

  it('keeps an authenticated guest on the separate host login screen', async () => {
    const { default: router } = await import('../src/router');
    const store = useAuthStore();
    store.initialized = true;
    store.user = { role: 'guest' };

    await router.push('/host/login');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('host-login');
  });
});
