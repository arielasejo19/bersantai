<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { villaService } from '@/services/villaService';

const router = useRouter();
const notifications = ref([]);
const unreadCount = ref(0);
const isOpen = ref(false);
const feedError = ref(false);
const loading = ref(false);
let cursor = null;
let pollTimer;

const actionLabels = {
  'booking-requested': 'New booking request',
  'booking-confirmed': 'Booking confirmed',
  'villa-assigned': 'Villa assigned',
  'villa-reassigned': 'Villa reassigned',
  'check-in': 'Guest checked in',
  'check-out': 'Guest checked out',
  'charge-added': 'Charge added',
  'charge-removed': 'Charge removed',
  'payment-collected': 'Payment collected',
  'booking-cancelled': 'Booking cancelled',
  'booking-no-show': 'Marked as no-show',
  'booking-reopened': 'Booking reopened'
};

function newestId(entries) {
  return entries.reduce((largest, entry) => BigInt(entry.id) > BigInt(largest) ? entry.id : largest, '0');
}

async function refresh() {
  if (loading.value || document.visibilityState === 'hidden') return;
  loading.value = true;
  try {
    const result = await villaService.notifications(cursor);
    const incoming = result.notifications || [];
    feedError.value = false;
    if (cursor === null) {
      notifications.value = incoming;
      cursor = result.cursor || newestId(incoming);
    } else if (incoming.length) {
      notifications.value = [...incoming.slice().reverse(), ...notifications.value].slice(0, 30);
      if (!isOpen.value) unreadCount.value += incoming.length;
    }
    if (result.cursor) cursor = result.cursor;
  } catch (_error) {
    feedError.value = true;
  } finally {
    loading.value = false;
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) unreadCount.value = 0;
}

function openReservation(notification) {
  isOpen.value = false;
  router.push({ name: 'reservation-detail', params: { reservationId: notification.reservationId } });
}

function notificationTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

onMounted(() => {
  refresh();
  pollTimer = window.setInterval(refresh, 5000);
});
onUnmounted(() => window.clearInterval(pollTimer));
</script>

<template>
  <div class="notification-center">
    <button class="notification-trigger" type="button" aria-label="Notifications" :aria-expanded="isOpen" aria-controls="notification-panel" @click="togglePanel">
      <span>Notifications</span><span v-if="unreadCount" class="notification-count" aria-label="Unread notifications">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>
    <section v-if="isOpen" id="notification-panel" class="notification-panel" aria-label="Reservation notifications">
      <header class="notification-panel-heading"><h2>Activity</h2><span v-if="notifications.length">{{ notifications.length }}</span></header>
      <p v-if="feedError" class="notification-feed-error" role="status">Updates are temporarily unavailable.</p>
      <p v-else-if="!notifications.length" class="notification-empty">No recent activity.</p>
      <div v-else class="notification-list" aria-live="polite">
        <button v-for="notification in notifications" :key="notification.id" class="notification-item" type="button" @click="openReservation(notification)">
          <span class="notification-item-heading"><strong>{{ actionLabels[notification.action] || 'Reservation updated' }}</strong><time>{{ notificationTime(notification.occurredAt) }}</time></span>
          <span class="notification-item-guest">{{ notification.guestName || 'Guest' }}<span v-if="notification.referenceNumber"> · {{ notification.referenceNumber }}</span></span>
          <span class="notification-item-meta">{{ notification.accommodationName }}<span v-if="notification.staffName"> · {{ notification.staffName }}</span></span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.notification-center { position: relative; }
.notification-trigger { display: flex; min-height: 38px; align-items: center; gap: 9px; border: 1px solid #dce4dc; padding: 0 11px; background: #fffdf8; color: #264b45; cursor: pointer; font: 600 12px Arial, sans-serif; }
.notification-trigger:hover, .notification-trigger[aria-expanded="true"] { border-color: #176059; }
.notification-count { display: grid; min-width: 18px; height: 18px; place-items: center; padding: 0 4px; background: #b65e49; color: #fff; font-size: 10px; line-height: 1; }
.notification-panel { position: absolute; z-index: 40; top: calc(100% + 10px); right: 0; display: grid; width: min(390px, calc(100vw - 32px)); max-height: min(70vh, 560px); grid-template-rows: auto 1fr; overflow: hidden; border: 1px solid #dce4dc; background: #fffdf8; box-shadow: 0 18px 45px rgb(23 61 58 / 18%); }
.notification-panel-heading { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e4e9e2; padding: 14px 16px; }
.notification-panel-heading h2 { margin: 0; color: #173d3a; font: 500 19px Georgia, serif; }
.notification-panel-heading span { color: #89958d; font: 11px Arial, sans-serif; }
.notification-list { overflow-y: auto; }
.notification-item { display: grid; width: 100%; gap: 6px; border: 0; border-bottom: 1px solid #e9ede7; padding: 13px 16px; background: #fffdf8; color: #52605a; cursor: pointer; text-align: left; }
.notification-item:last-child { border-bottom: 0; }
.notification-item:hover { background: #f3f7f1; }
.notification-item-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.notification-item-heading strong { color: #176059; font-size: 12px; }
.notification-item-heading time, .notification-item-meta { color: #89958d; font-size: 10px; line-height: 1.5; }
.notification-item-guest { overflow-wrap: anywhere; color: #264b45; font-size: 12px; }
.notification-empty, .notification-feed-error { margin: 0; padding: 18px 16px; color: #89958d; font-size: 12px; }
.notification-feed-error { color: #9d4b38; }
@media (max-width: 520px) { .notification-panel { position: fixed; top: 78px; right: 12px; max-height: calc(100vh - 96px); } }
</style>
