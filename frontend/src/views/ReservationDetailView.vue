<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { villaService } from '@/services/villaService';
import ReservationStatementPanel from '@/components/ReservationStatementPanel.vue';

const route = useRoute();
const router = useRouter();
const reservation = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');

async function load() {
  try {
    const result = await villaService.allReservations();
    reservation.value = result.reservations.find((item) => String(item.id) === String(route.params.reservationId)) || null;
    if (!reservation.value) error.value = 'Reservation not found';
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}
async function updateStatus(status) {
  if (!reservation.value?.villa_id) { error.value = 'This reservation needs a room assignment before its status can be changed.'; return; }
  saving.value = true; error.value = '';
  try { await villaService.updateReservation(reservation.value.villa_id, reservation.value.id, status); reservation.value = { ...reservation.value, booking_status: status }; } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
function backToCalendar() { router.push({ name: 'management', query: { section: 'reservations' } }); }
function statusLabel(status) { return String(status || 'pending').replaceAll('_', ' '); }
onMounted(load);
</script>

<template>
  <main class="editor-page reservation-detail-page"><header class="editor-page-header"><button class="editor-back-button" type="button" @click="backToCalendar"><span aria-hidden="true">←</span><span>Back to reservation calendar</span></button><img src="/icons/bersantai-logo.png" alt="Bersantai" class="editor-page-logo"></header><section v-if="loading" class="editor-page-loading">Loading reservation details...</section><section v-else-if="reservation" class="reservation-detail-layout"><div class="reservation-detail-header"><div><p class="eyebrow">Reservation details</p><h1>{{ reservation.guest_name }}</h1><p>{{ reservation.reference_number || reservation.id }} · {{ reservation.villa_name || reservation.villa_type_name || 'Awaiting room assignment' }}</p></div><span class="reservation-detail-status">{{ statusLabel(reservation.booking_status) }}</span></div><p v-if="error" class="management-error" role="alert">{{ error }}</p><section class="reservation-detail-card"><div><span>Stay dates</span><strong>{{ reservation.check_in }} → {{ reservation.check_out }}</strong></div><div><span>Guest email</span><strong>{{ reservation.guest_email }}</strong></div><div><span>Guests</span><strong>{{ reservation.guests || '—' }}</strong></div><div><span>Payment status</span><strong>{{ reservation.payment_status || 'unpaid' }}</strong></div></section><section class="reservation-detail-actions"><button type="button" :disabled="saving || reservation.booking_status === 'cancelled'" @click="updateStatus('checked_in')">Check in</button><button type="button" :disabled="saving || reservation.booking_status === 'cancelled'" @click="updateStatus('checked_out')">Check out</button><button class="danger-action" type="button" :disabled="saving || reservation.booking_status === 'cancelled'" @click="updateStatus('cancelled')">Cancel reservation</button></section><ReservationStatementPanel :reservation="reservation"></ReservationStatementPanel></section><section v-else class="reservation-detail-layout"><p class="management-error" role="alert">{{ error }}</p><button class="dashboard-primary" type="button" @click="backToCalendar">Return to calendar</button></section></main>
</template>
