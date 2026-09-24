<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { villaService } from '@/services/villaService';
import { formatCurrency } from '@/services/currency';
import ReservationGantt from '@/components/ReservationGantt.vue';
import ReservationStatementPanel from '@/components/ReservationStatementPanel.vue';

const props = defineProps({ reservations: { type: Array, default: () => [] }, villas: { type: Array, default: () => [] } });
const emit = defineEmits(['refresh']);
const router = useRouter();
const today = new Date().toISOString().slice(0, 10);
const dateRange = reactive({ startDate: today, endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) });
const selectedReservation = ref(null);
const actionSaving = ref(false);
const error = ref('');
const visibleReservations = computed(() => props.reservations);
function selectReservation(reservation) { selectedReservation.value = reservation; error.value = ''; router.push({ name: 'reservation-detail', params: { reservationId: reservation.id } }); }
function setRange(days) { dateRange.startDate = today; dateRange.endDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10); }
async function updateStatus(status) {
  if (!selectedReservation.value?.villa_id) { error.value = 'This reservation needs a room assignment before its status can be changed.'; return; }
  actionSaving.value = true; error.value = '';
  try { await villaService.updateReservation(selectedReservation.value.villa_id, selectedReservation.value.id, status); selectedReservation.value = { ...selectedReservation.value, booking_status: status }; emit('refresh'); } catch (requestError) { error.value = requestError.message; } finally { actionSaving.value = false; }
}
function statusLabel(status) { return String(status || 'pending').replaceAll('_', ' '); }
</script>

<template>
  <div class="reservation-workspace"><div class="dashboard-toolbar reservation-calendar-toolbar"><div><h2>Reservations</h2><p>View every room and booking across the properties you can access.</p></div><div class="calendar-range-controls"><label>From<input v-model="dateRange.startDate" type="date"></label><label>To<input v-model="dateRange.endDate" type="date"></label><div class="range-presets"><button type="button" @click="setRange(14)">14 days</button><button type="button" @click="setRange(30)">30 days</button><button type="button" @click="setRange(60)">60 days</button></div></div></div><p v-if="error" class="management-error" role="alert">{{ error }}</p><ReservationGantt :reservations="visibleReservations" :villas="villas" :start-date="dateRange.startDate" :end-date="dateRange.endDate" @select="selectReservation"></ReservationGantt><section class="reservation-booking-list"><div class="reservation-heading"><div><span class="eyebrow">All bookings</span><h3>{{ visibleReservations.length }} reservations</h3></div></div><article v-for="reservation in visibleReservations" :key="reservation.id" class="reservation-list-row" :class="{ selected: selectedReservation?.id === reservation.id }" role="button" tabindex="0" @click="selectReservation(reservation)" @keydown.enter="selectReservation(reservation)"><div><strong>{{ reservation.guest_name }}</strong><small>{{ reservation.reference_number || reservation.id }} · {{ reservation.villa_name || reservation.villa_type_name || 'Awaiting room assignment' }}</small></div><div><strong>{{ reservation.check_in }} → {{ reservation.check_out }}</strong><small>{{ formatCurrency(reservation.total_amount) }} · {{ statusLabel(reservation.booking_status) }}</small></div></article><p v-if="!visibleReservations.length" class="empty-state">No reservations found.</p></section><section v-if="selectedReservation" class="reservation-detail-workspace"><div class="reservation-action-card"><div><span class="eyebrow">Selected booking</span><h3>{{ selectedReservation.guest_name }}</h3><p>{{ selectedReservation.villa_name || selectedReservation.villa_type_name || 'Awaiting room assignment' }} · {{ selectedReservation.guest_email }}</p></div><div class="reservation-action-buttons"><button type="button" :disabled="actionSaving || selectedReservation.booking_status === 'cancelled'" @click="updateStatus('checked_in')">Check in</button><button type="button" :disabled="actionSaving || selectedReservation.booking_status === 'cancelled'" @click="updateStatus('checked_out')">Check out</button><button class="danger-action" type="button" :disabled="actionSaving || selectedReservation.booking_status === 'cancelled'" @click="updateStatus('cancelled')">Cancel reservation</button></div></div><ReservationStatementPanel :reservation="selectedReservation"></ReservationStatementPanel></section></div>
</template>
