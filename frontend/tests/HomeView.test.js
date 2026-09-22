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

  it('renders the public landing page', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    });

    expect(wrapper.text()).toContain('Find your');
    expect(wrapper.text()).toContain('island rhythm');
    expect(wrapper.text()).toContain('Stays worth');
    expect(wrapper.text()).toContain('Island services');
    expect(wrapper.text()).not.toContain('Beyond the villa');
    expect(wrapper.text()).not.toContain('Moments of');
    expect(wrapper.findAll('.villa-card')).toHaveLength(3);
  });
});
