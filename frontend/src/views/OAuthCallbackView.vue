<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabaseClient';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

function destination(user) {
  const role = String(user?.role || '').trim().toLowerCase();
  return ['admin', 'host', 'receptionist'].includes(role)
    ? '/management'
    : route.query.redirect?.toString() || '/profile';
}

onMounted(async () => {
  try {
    if (route.query.error_description || route.query.error) throw new Error(route.query.error_description?.toString() || 'Social login was cancelled.');
    if (!supabase) throw new Error('Social login is not configured.');
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!data.session?.access_token) throw new Error('No social login session was returned.');
    const user = await authStore.completeSocialLogin(data.session.access_token);
    await router.replace(destination(user));
  } catch (requestError) {
    error.value = requestError.message || 'Social login could not be completed.';
  }
});
</script>

<template>
  <main class="auth-shell">
    <section class="auth-panel" aria-labelledby="oauth-title">
      <img class="auth-brand-image" :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai Bali Private Resort" />
      <p class="eyebrow">Authentication</p>
      <h1 id="oauth-title">{{ error ? 'Login unsuccessful' : 'Completing login' }}</h1>
      <p class="login-intro">{{ error || 'Returning you to Bersantai...' }}</p>
      <RouterLink v-if="error" class="primary-button" to="/login">Return to login</RouterLink>
    </section>
  </main>
</template>