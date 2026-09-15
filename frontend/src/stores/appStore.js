import { defineStore } from 'pinia';
import { healthService } from '@/services/healthService';

export const useAppStore = defineStore('app', {
  state: () => ({
    health: null,
    healthLoading: false,
    healthError: null
  }),
  actions: {
    async loadHealth() {
      this.healthLoading = true;
      this.healthError = null;

      try {
        this.health = await healthService.getHealth();
      } catch (error) {
        this.healthError = error.message;
      } finally {
        this.healthLoading = false;
      }
    }
  }
});
