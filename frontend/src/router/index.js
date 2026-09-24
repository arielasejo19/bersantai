import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import RegisterView from '@/views/RegisterView.vue';
import ManagementView from '@/views/ManagementView.vue';
import OAuthCallbackView from '@/views/OAuthCallbackView.vue';
import VillaEditorView from '@/views/VillaEditorView.vue';
import VillaDetailView from '@/views/VillaDetailView.vue';

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
      path: '/auth/callback',
      name: 'oauth-callback',
      component: OAuthCallbackView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true }
    },
    {
      path: '/booking',
      name: 'booking',
      component: () => import('@/views/BookingView.vue')
    },
    {
      path: '/villas/:villaId',
      name: 'villa-detail',
      component: VillaDetailView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/bookings',
      name: 'guest-bookings',
      component: () => import('@/views/GuestBookingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/management',
      name: 'management',
      component: ManagementView,
      meta: { requiresAuth: true, managementOnly: true }
    },
    {
      path: '/management/reservations/:reservationId',
      name: 'reservation-detail',
      component: () => import('@/views/ReservationDetailView.vue'),
      meta: { requiresAuth: true, managementOnly: true }
    }
    ,{
      path: '/management/villas/new',
      name: 'villa-create',
      component: VillaEditorView,
      meta: { requiresAuth: true, managementOnly: true, villaEditor: true }
    },
    {
      path: '/management/villas/:villaId/edit',
      name: 'villa-edit',
      component: VillaEditorView,
      meta: { requiresAuth: true, managementOnly: true, villaEditor: true }
    },
    {
      path: '/management/villa-types/new',
      name: 'villa-type-create',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'villa-type' }
    },
    {
      path: '/management/villa-types/:resourceId/edit',
      name: 'villa-type-edit',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'villa-type' }
    },
    {
      path: '/management/services/new',
      name: 'service-create',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'service' }
    },
    {
      path: '/management/services/:resourceId/edit',
      name: 'service-edit',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'service' }
    },
    {
      path: '/management/menus/new',
      name: 'menu-create',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'menu' }
    },
    {
      path: '/management/menus/:resourceId/edit',
      name: 'menu-edit',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'menu' }
    },
    {
      path: '/management/packages/new',
      name: 'package-create',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'package' }
    },
    {
      path: '/management/packages/:resourceId/edit',
      name: 'package-edit',
      component: () => import('@/views/AdminContentEditorView.vue'),
      meta: { requiresAuth: true, managementOnly: true, adminOnly: true, resource: 'package' }
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

  if (to.meta.villaEditor && !['admin', 'host'].includes(authStore.user?.role)) {
    return { name: 'management' };
  }

  if (to.meta.adminOnly && authStore.user?.role !== 'admin') {
    return { name: 'management' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (to.meta.hostLogin && ['admin', 'host', 'receptionist'].includes(authStore.user?.role)) {
      return { name: 'management' };
    }
    if (to.meta.hostLogin) return true;
    return { name: 'profile' };
  }

  return true;
});

export default router;
