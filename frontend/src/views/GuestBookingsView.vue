<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { profileService } from '@/services/profileService';
import { formatCurrency } from '@/services/currency';

const router = useRouter();
const reservations = ref([]);
const loading = ref(true);
const error = ref('');

function formatDate(value) {
  if (!value) return 'Date pending';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadBookings() {
  try {
    reservations.value = (await profileService.getBookings()).reservations;
  } catch (requestError) {
    error.value = requestError.message || 'Bookings could not be loaded.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadBookings);
</script>

<template>
  <main class="guest-bookings-page">
    <header class="guest-bookings-header"><RouterLink class="brand" to="/"><img class="brand-logo" :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai"></RouterLink><RouterLink class="text-link" to="/">Back home</RouterLink></header>
    <section class="guest-bookings-content" aria-labelledby="guest-bookings-title">
      <div class="guest-bookings-heading"><div><p class="eyebrow">Your Bersantai stays</p><h1 id="guest-bookings-title">Manage your<br><em>bookings.</em></h1><p>Review your upcoming stays and keep every detail close at hand.</p></div><RouterLink class="button button-dark" to="/">Book another stay <span aria-hidden="true">↗</span></RouterLink></div>
      <p v-if="error" class="booking-error" role="alert">{{ error }}</p>
      <div v-if="loading" class="guest-bookings-empty">Loading your bookings...</div>
      <div v-else-if="!reservations.length" class="guest-bookings-empty"><strong>No bookings yet</strong><span>Your next quiet escape starts with a villa.</span><RouterLink class="button button-dark" to="/">Explore villas <span aria-hidden="true">↗</span></RouterLink></div>
      <div v-else class="guest-booking-list"><article v-for="booking in reservations" :key="booking.id" class="guest-booking-card"><div class="guest-booking-card-heading"><div><p class="eyebrow">{{ booking.referenceNumber || `Booking ${booking.id}` }}</p><h2>{{ booking.villaName }}</h2></div><span :class="`guest-booking-status ${booking.bookingStatus}`">{{ booking.bookingStatus.replace('_', ' ') }}</span></div><dl><div><dt>Stay</dt><dd>{{ formatDate(booking.checkIn) }} - {{ formatDate(booking.checkOut) }}</dd></div><div><dt>Type</dt><dd>{{ booking.bookingKind === 'day_tour' ? 'Day tour' : 'Overnight stay' }}</dd></div><div><dt>Total</dt><dd>{{ formatCurrency(booking.totalAmount) }}</dd></div><div><dt>Payment</dt><dd>{{ booking.paymentStatus.replace('_', ' ') }}</dd></div></dl><div class="guest-booking-actions"><button class="text-link" type="button" @click="router.push({ name: 'booking', query: { villaId: booking.villaId || undefined, bookingKind: booking.bookingKind } })">Book this stay again <span aria-hidden="true">↗</span></button></div></article></div>
    </section>
  </main>
</template>
