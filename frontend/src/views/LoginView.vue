<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const isHostLogin = route.name === 'host-login';

const form = reactive({
  email: '',
  password: ''
});

async function submit() {
  const loggedInUser = await authStore.login(form);
  const role = String(loggedInUser.role || '').trim().toLowerCase();
  const isManagementRole = ['admin', 'host', 'receptionist'].includes(role);
  const destination = isManagementRole
    ? '/management'
    : route.query.redirect?.toString() || '/profile';

  await router.push(destination);
}
</script>

<template>
  <main class="auth-shell">
    <section class="auth-panel" aria-labelledby="login-title">
      <p class="eyebrow">{{ isHostLogin ? 'Bersantai partner portal' : 'Welcome back' }}</p>
      <h1 id="login-title">{{ isHostLogin ? 'Host login' : 'Log in' }}</h1>
      <p v-if="isHostLogin" class="login-intro">Manage your villa, availability, and guest stays from one calm workspace.</p>

      <form class="form-stack" @submit.prevent="submit">
        <label>
          Email
          <input v-model="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="form-footer">
        New to Bersantai?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
