import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import RegisterView from '@/views/RegisterView.vue';
import ManagementView from '@/views/ManagementView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/host/login',
      name: 'host-login',
      component: LoginView,
      meta: { guestOnly: true, hostLogin: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/management',
      name: 'management',
      component: ManagementView,
      meta: { requiresAuth: true, managementOnly: true }
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  await authStore.restoreSession();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.managementOnly && !['admin', 'host', 'receptionist'].includes(authStore.user?.role)) {
    return { name: 'profile' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'profile' };
  }

  return true;
});

export default router;
