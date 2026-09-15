<script setup>
import { onMounted, reactive, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const { user, profile, loading, error, profileSaved } = storeToRefs(authStore);

const form = reactive({
  displayName: '',
  bio: '',
  avatarUrl: ''
});

watch(
  profile,
  (value) => {
    if (!value) return;
    form.displayName = value.displayName || '';
    form.bio = value.bio || '';
    form.avatarUrl = value.avatarUrl || '';
  },
  { immediate: true }
);

onMounted(() => {
  authStore.loadProfile();
});

async function saveProfile() {
  await authStore.updateProfile({
    displayName: form.displayName,
    bio: form.bio,
    avatarUrl: form.avatarUrl
  });
}

async function logout() {
  await authStore.logout();
  await router.push('/login');
}
</script>

<template>
  <main class="auth-shell">
    <section class="auth-panel wide" aria-labelledby="profile-title">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Your account</p>
          <h1 id="profile-title">Profile</h1>
        </div>
        <div class="profile-links">
          <RouterLink v-if="['admin', 'host', 'receptionist'].includes(user?.role)" class="text-link" to="/management">Manage villas</RouterLink>
          <RouterLink class="text-link" to="/">Home</RouterLink>
        </div>
      </div>

      <form class="form-stack" @submit.prevent="saveProfile">
        <label>
          Email
          <input :value="user?.email" type="email" disabled />
        </label>

        <label>
          Display name
          <input v-model="form.displayName" type="text" required minlength="2" />
        </label>

        <label>
          Bio
          <textarea v-model="form.bio" rows="5" placeholder="Add a short intro." />
        </label>

        <label>
          Avatar URL
          <input v-model="form.avatarUrl" type="url" placeholder="https://example.com/avatar.jpg" />
        </label>

        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p v-if="profileSaved" class="success" role="status">Profile saved.</p>

        <div class="button-row">
          <button class="primary-button" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save profile' }}
          </button>
          <button class="secondary-button" type="button" :disabled="loading" @click="logout">
            Log out
          </button>
        </div>
      </form>
    </section>
  </main>
</template>
