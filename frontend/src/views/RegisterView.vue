<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const localError = ref(null);

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  passwordConfirmation: ''
});

const passwordMismatch = computed(
  () => form.passwordConfirmation.length > 0 && form.password !== form.passwordConfirmation
);

async function submit() {
  localError.value = null;

  if (form.password !== form.passwordConfirmation) {
    localError.value = 'Passwords do not match';
    return;
  }

  await authStore.register({
    displayName: form.displayName,
    email: form.email,
    password: form.password
  });
  await router.push('/profile');
}
</script>

<template>
  <main class="auth-shell guest-auth-shell">
    <section class="auth-panel" aria-labelledby="register-title">
      <RouterLink class="auth-brand" to="/" aria-label="Bersantai home"><img :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai Bali Private Resort" /></RouterLink>
      <p class="eyebrow">Start relaxing</p>
      <h1 id="register-title">Create account</h1>

      <form class="form-stack" @submit.prevent="submit">
        <label>
          Display name
          <input v-model="form.displayName" type="text" autocomplete="name" required minlength="2" />
        </label>

        <label>
          Email
          <input v-model="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" autocomplete="new-password" required minlength="8" />
        </label>

        <label>
          Confirm password
          <input v-model="form.passwordConfirmation" type="password" autocomplete="new-password" required />
        </label>

        <p v-if="passwordMismatch" class="field-hint">Passwords do not match.</p>
        <p v-if="localError || error" class="error" role="alert">{{ localError || error }}</p>

        <button class="primary-button" type="submit" :disabled="loading || passwordMismatch">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="form-footer">
        Already have an account?
        <RouterLink to="/login">Log in</RouterLink>
      </p>
    </section>
  </main>
</template>
