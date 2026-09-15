<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

const appStore = useAppStore();
const authStore = useAuthStore();
const { health, healthLoading, healthError } = storeToRefs(appStore);
const { isAuthenticated, user } = storeToRefs(authStore);

const apiStatus = computed(() => {
  if (healthLoading.value) return 'Checking API';
  if (healthError.value) return 'API unavailable';
  return health.value?.status === 'ok' ? 'API online' : 'Waiting for API';
});

const databaseStatus = computed(() => {
  if (!health.value?.database) return 'Not checked';
  return health.value.database.status;
});

onMounted(() => {
  appStore.loadHealth();
});
</script>

<template>
  <main class="shell">
    <section class="status-panel" aria-labelledby="home-title">
      <p class="eyebrow">Bersantai foundation</p>
      <h1 id="home-title">Vue PWA to Express API</h1>
      <p class="summary">
        The new application shell is running with router, Pinia, PWA registration,
        and a centralized API client.
      </p>

      <nav class="action-row" aria-label="Primary navigation">
        <RouterLink v-if="isAuthenticated" class="button-link" to="/profile">View profile</RouterLink>
        <RouterLink v-else class="button-link" to="/login">Log in</RouterLink>
        <RouterLink v-if="!isAuthenticated" class="button-link secondary" to="/register">Create account</RouterLink>
      </nav>

      <p v-if="user" class="signed-in">Signed in as {{ user.email }}</p>

      <div class="status-grid" aria-label="Application status">
        <div class="status-item">
          <span>Frontend</span>
          <strong>Vue ready</strong>
        </div>
        <div class="status-item">
          <span>Backend</span>
          <strong>{{ apiStatus }}</strong>
        </div>
        <div class="status-item">
          <span>Database</span>
          <strong>{{ databaseStatus }}</strong>
        </div>
      </div>

      <p v-if="healthError" class="error" role="status">
        {{ healthError }}
      </p>
    </section>
  </main>
</template>
