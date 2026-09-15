import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeView from '../src/views/HomeView.vue';

vi.mock('../src/services/healthService', () => ({
  healthService: {
    getHealth: vi.fn().mockResolvedValue({
      status: 'ok',
      database: { status: 'not_configured' }
    })
  }
}));

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders the Bersantai foundation status', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    });

    expect(wrapper.text()).toContain('Bersantai foundation');
    expect(wrapper.text()).toContain('Vue ready');
  });
});
