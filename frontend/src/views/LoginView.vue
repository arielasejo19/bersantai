<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const isHostLogin = route.name === 'host-login';

const form = reactive({
  email: '',
  password: ''
});

async function socialLogin(provider) {
  const email = form.email || window.prompt(`Development ${provider} email`);
  if (!email) return;
  const loggedInUser = await authService.social({ provider, providerUserId: `${provider}-${email}`, email, displayName: email.split('@')[0] });
  authStore.user = loggedInUser.user;
  await router.push('/profile');
}

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

      <div class="social-login"><span>Or continue with</span><div><button class="secondary-button" type="button" @click="socialLogin('google')">Continue with Google</button><button class="secondary-button" type="button" @click="socialLogin('facebook')">Continue with Facebook</button></div></div>

      <p class="form-footer">
        New to Bersantai?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
