<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const isHostLogin = computed(() => route.name === 'host-login');
const socialProvider = ref('');

function chooseLoginMode(mode) {
  const target = mode === 'host' ? '/host/login' : '/login';
  const query = { ...route.query };
  router.push({ path: target, query });
}

const form = reactive({
  email: '',
  password: ''
});

async function socialLogin(provider) {
  socialProvider.value = provider;
  try {
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (route.query.redirect) callbackUrl.searchParams.set('redirect', route.query.redirect.toString());
    await authStore.startSocialLogin(provider, callbackUrl.toString());
  } finally {
    socialProvider.value = '';
  }
}

async function submit() {
  const loggedInUser = await authStore.login(form);
  const role = String(loggedInUser.role || '').trim().toLowerCase();
  const isManagementRole = ['admin', 'host', 'receptionist'].includes(role);
  const destination = isManagementRole
    ? '/management'
    : '/';

  await router.push(destination);
}
</script>

<template>
  <main class="auth-shell" :class="{ 'host-auth-shell': isHostLogin, 'guest-auth-shell': !isHostLogin }">
    <div class="host-nature" :class="{ 'guest-nature': !isHostLogin }" aria-hidden="true"><span class="host-leaf host-leaf-one"></span><span class="host-leaf host-leaf-two"></span><span class="host-leaf host-leaf-three"></span><span class="host-leaf host-leaf-four"></span><span class="host-light host-light-one"></span><span class="host-light host-light-two"></span><span class="thai-ornament thai-ornament-top"></span><span class="thai-ornament thai-ornament-bottom"></span></div>
    <section class="auth-panel" aria-labelledby="login-title">
      <RouterLink class="auth-brand" to="/" aria-label="Bersantai home"><img :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai Bali Private Resort" /></RouterLink>
      <p class="eyebrow">{{ isHostLogin ? 'Bersantai partner portal' : 'Bersantai guest portal' }}</p>
      <h1 id="login-title">{{ isHostLogin ? 'Host login' : 'Guest login' }}</h1>
      <p v-if="isHostLogin" class="login-intro">Manage your villa, availability, and guest stays from one calm workspace.</p>
      <p v-else class="login-intro">Access your account and manage your stays with ease.</p>

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

        <button class="primary-button" :class="{ 'host-login-button': isHostLogin, 'guest-login-button': !isHostLogin }" type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <div class="social-login"><span>Or continue with</span><div><button class="secondary-button social-button" type="button" :disabled="loading" @click="socialLogin('google')"><span class="provider-icon provider-google" aria-hidden="true">G</span>{{ socialProvider === 'google' ? 'Connecting...' : 'Login with Google' }}</button><button class="secondary-button social-button" type="button" :disabled="loading" @click="socialLogin('facebook')"><span class="provider-icon provider-facebook" aria-hidden="true">f</span>{{ socialProvider === 'facebook' ? 'Connecting...' : 'Login with Facebook' }}</button></div></div>

      <div class="auth-role-switch" role="tablist" aria-label="Choose login portal">
        <button type="button" :class="{ active: !isHostLogin }" :aria-selected="!isHostLogin" @click="chooseLoginMode('guest')">Guest portal</button>
        <button type="button" :class="{ active: isHostLogin }" :aria-selected="isHostLogin" @click="chooseLoginMode('host')">Host portal</button>
      </div>

      <p class="form-footer">
        New to Bersantai?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
