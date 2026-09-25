<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/services/currency';
import { villaService } from '@/services/villaService';
import ReservationStatementPanel from '@/components/ReservationStatementPanel.vue';

const route = useRoute();
const router = useRouter();
const { user } = storeToRefs(useAuthStore());
const reservation = ref(null);
const statement = ref(null);
const assignableVillas = ref([]);
const selectedVillaId = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const activeDialog = ref('');
const checkInRemarks = ref('');
const checkOutRemarks = ref('');

const hotelMode = computed(() => (reservation.value?.booking_mode || (reservation.value?.villa_id ? 'airbnb' : 'hotel')) === 'hotel');
const isAdmin = computed(() => user.value?.role === 'admin');
const canOperate = computed(() => ['admin', 'receptionist'].includes(user.value?.role));
const nights = computed(() => {
  if (!reservation.value) return 0;
  return Math.max(0, Math.round((new Date(`${String(reservation.value.check_out).slice(0, 10)}T00:00:00Z`) - new Date(`${String(reservation.value.check_in).slice(0, 10)}T00:00:00Z`)) / 86400000));
});
const canCheckIn = computed(() => reservation.value?.booking_status === 'confirmed' && Boolean(reservation.value?.villa_id) && String(reservation.value.check_in).slice(0, 10) <= new Date().toISOString().slice(0, 10));
const canNoShow = computed(() => reservation.value?.booking_status === 'confirmed' && String(reservation.value.check_in).slice(0, 10) < new Date().toISOString().slice(0, 10));
const closedReservation = computed(() => ['checked_out', 'cancelled', 'no_show'].includes(reservation.value?.booking_status));
const selectedVilla = computed(() => assignableVillas.value.find((villa) => String(villa.id) === String(selectedVillaId.value)));

function dateLabel(value) {
  if (!value) return 'Not recorded';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
function dateTimeLabel(value) {
  if (!value) return 'Not recorded';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
function statusLabel(value) { return String(value || 'pending').replaceAll('_', ' '); }
function activityLabel(action) {
  return ({
    'booking-requested': 'Booking requested', 'booking-confirmed': 'Booking confirmed',
    'villa-assigned': 'Villa assigned', 'villa-reassigned': 'Villa assignment changed',
    'check-in': 'Checked in', 'check-out': 'Checked out', 'booking-cancelled': 'Booking cancelled',
    'booking-no-show': 'Marked no show', 'booking-reopened': 'Booking reopened'
  })[action] || String(action).replaceAll('-', ' ');
}
function backToCalendar() { router.push({ name: 'management', query: { section: 'reservations' } }); }

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const result = await villaService.reservation(route.params.reservationId);
    reservation.value = result.reservation;
    statement.value = (await villaService.reservationStatement(route.params.reservationId)).statement;
  } catch (requestError) {
    reservation.value = null;
    error.value = requestError.message;
  } finally { loading.value = false; }
}

function openConfirm() { error.value = ''; activeDialog.value = 'confirm'; }
async function confirmBooking() {
  saving.value = true; error.value = ''; notice.value = '';
  try {
    const result = await villaService.confirmReservation(reservation.value.id);
    notice.value = result.confirmationEmailSent ? 'Booking confirmed and confirmation email sent.' : 'Booking confirmed. The email could not be sent; you can retry it below.';
    activeDialog.value = '';
    await load();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

async function openAssign() {
  saving.value = true; error.value = ''; activeDialog.value = '';
  try {
    assignableVillas.value = (await villaService.assignableVillas(reservation.value.id)).villas;
    selectedVillaId.value = reservation.value.villa_id || '';
    activeDialog.value = 'assign';
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
async function assignVilla() {
  if (!selectedVillaId.value) return;
  saving.value = true; error.value = ''; notice.value = '';
  try {
    await villaService.assignReservation(reservation.value.id, selectedVillaId.value);
    activeDialog.value = '';
    notice.value = `Villa ${selectedVilla.value?.name || ''} assigned to this booking.`;
    await load();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

function openCheckIn() { checkInRemarks.value = ''; activeDialog.value = 'check-in'; error.value = ''; }
async function checkIn() {
  saving.value = true; error.value = ''; notice.value = '';
  try {
    const result = await villaService.checkInReservation(reservation.value.id, { remarks: checkInRemarks.value });
    notice.value = result.notificationEmailSent ? 'Guest checked in. Confirmation email sent.' : 'Guest checked in. The email could not be sent; you can retry it below.';
    activeDialog.value = '';
    await load();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

async function openCheckOut() {
  saving.value = true; error.value = '';
  try {
    statement.value = (await villaService.reservationStatement(reservation.value.id)).statement;
    checkOutRemarks.value = '';
    activeDialog.value = 'check-out';
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
async function checkOut() {
  saving.value = true; error.value = ''; notice.value = '';
  try {
    const result = await villaService.checkOutReservation(reservation.value.id, { remarks: checkOutRemarks.value });
    statement.value = result.statement;
    notice.value = result.notificationEmailSent ? 'Check-out completed. Receipt email sent.' : 'Check-out completed. The email could not be sent; you can retry it below.';
    activeDialog.value = '';
    await load();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

async function cancelBooking() {
  if (!window.confirm(`Cancel booking ${reservation.value.reference_number}? This releases its dates.`)) return;
  saving.value = true; error.value = ''; notice.value = '';
  try { await villaService.changeReservationState(reservation.value.id, 'cancelled'); notice.value = 'Booking cancelled.'; await load(); }
  catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
async function markNoShow() {
  if (!window.confirm(`Mark ${reservation.value.guest_name} as a no show?`)) return;
  saving.value = true; error.value = ''; notice.value = '';
  try { await villaService.changeReservationState(reservation.value.id, 'no_show'); notice.value = 'Booking marked as no show.'; await load(); }
  catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
async function reopenBooking() {
  if (!window.confirm(`Reopen ${reservation.value.reference_number}? The stay returns to Confirmed.`)) return;
  saving.value = true; error.value = ''; notice.value = '';
  try { await villaService.changeReservationState(reservation.value.id, 'reopen'); notice.value = 'Booking reopened.'; await load(); }
  catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
async function resendEmail(type) {
  saving.value = true; error.value = ''; notice.value = '';
  try {
    const result = await villaService.resendReservationEmail(reservation.value.id, type);
    notice.value = result.emailSent ? 'Email sent.' : 'Email could not be sent. Check the latest email log and SMTP configuration.';
    await load();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

watch(() => route.params.reservationId, load, { immediate: true });
</script>

<template>
  <main class="editor-page reservation-detail-page">
    <header class="editor-page-header">
      <button class="editor-back-button" type="button" @click="backToCalendar"><span aria-hidden="true">←</span><span>Back to reservations</span></button>
      <img src="/icons/bersantai-logo.png" alt="Bersantai" class="editor-page-logo">
    </header>

    <section v-if="loading" class="editor-page-loading">Loading reservation details...</section>
    <section v-else-if="reservation" class="reservation-detail-layout">
      <div class="reservation-detail-header">
        <div><p class="eyebrow">{{ hotelMode ? 'Hotel Mode reservation' : 'Airbnb Mode reservation' }}</p><h1>{{ reservation.guest_name }}</h1><p>{{ reservation.reference_number || reservation.id }} · {{ reservation.guest_email }}</p></div>
        <span class="reservation-detail-status" :class="`status-${reservation.booking_status}`">{{ statusLabel(reservation.booking_status) }}</span>
      </div>

      <p v-if="error" class="management-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="reservation-detail-notice" role="status">{{ notice }}</p>

      <section class="reservation-detail-actions" aria-label="Reservation actions">
        <button v-if="canOperate && reservation.booking_status === 'pending'" type="button" :disabled="saving" @click="openConfirm">Confirm booking</button>
        <button v-if="canOperate && hotelMode && reservation.booking_status === 'confirmed'" type="button" :disabled="saving" @click="openAssign">{{ reservation.villa_id ? 'Change assigned villa' : 'Assign villa' }}</button>
        <button v-if="canOperate && canCheckIn" type="button" :disabled="saving" @click="openCheckIn">Check in</button>
        <button v-if="canOperate && reservation.booking_status === 'checked_in'" type="button" :disabled="saving" @click="openCheckOut">Check out</button>
        <button v-if="canOperate && ['pending', 'confirmed'].includes(reservation.booking_status)" class="danger-action" type="button" :disabled="saving" @click="cancelBooking">Cancel booking</button>
        <button v-if="canOperate && canNoShow" class="danger-action" type="button" :disabled="saving" @click="markNoShow">Mark no show</button>
        <button v-if="isAdmin && closedReservation" type="button" :disabled="saving" @click="reopenBooking">Reopen booking</button>
        <span v-if="hotelMode && reservation.booking_status === 'confirmed' && !reservation.villa_id" class="reservation-assignment-warning">Awaiting staff assignment</span>
      </section>

      <div class="reservation-summary-grid">
        <article class="reservation-summary-card">
          <span>Guest</span>
          <strong>{{ reservation.guest_name }}</strong>
          <small>{{ reservation.guest_email }}</small>
        </article>
        <article class="reservation-summary-card">
          <span>Stay</span>
          <strong>{{ dateLabel(reservation.check_in) }}</strong>
          <small>to {{ dateLabel(reservation.check_out) }}</small>
        </article>
        <article class="reservation-summary-card">
          <span>Accommodation</span>
          <strong>{{ reservation.villa_name || reservation.villa_type_name || 'Unassigned' }}</strong>
          <small>{{ reservation.guests }} guests · {{ nights }} nights</small>
        </article>
        <article class="reservation-summary-card accent-card">
          <span>Balance</span>
          <strong>{{ formatCurrency(statement?.total ?? reservation.total_amount) }}</strong>
          <small>{{ formatCurrency(statement?.balance || 0) }} outstanding</small>
        </article>
      </div>

      <div class="reservation-detail-columns">
        <div class="reservation-detail-main">
          <section class="reservation-detail-section">
            <div class="reservation-section-heading"><div><p class="eyebrow">Reservation</p><h2>Booking details</h2></div></div>
            <dl class="reservation-facts">
              <div><dt>Reference</dt><dd>{{ reservation.reference_number || reservation.id }}</dd></div>
              <div><dt>Guest</dt><dd>{{ reservation.guest_name }}</dd></div>
              <div><dt>Contact</dt><dd><a :href="`mailto:${reservation.guest_email}`">{{ reservation.guest_email }}</a></dd></div>
              <div><dt>Contact number</dt><dd><a v-if="reservation.guest_phone" :href="`tel:${String(reservation.guest_phone).replace(/[^+\d]/g, '')}`">{{ reservation.guest_phone }}</a><span v-else>Not provided</span></dd></div>
              <div><dt>Booking source</dt><dd>{{ hotelMode ? 'Hotel · Villa Type' : 'Airbnb · Specific Villa' }}</dd></div>
              <div><dt>Booking status</dt><dd class="capitalize">{{ statusLabel(reservation.booking_status) }}</dd></div>
              <div><dt>Payment status</dt><dd class="capitalize">{{ reservation.payment_status || 'unpaid' }} · {{ reservation.payment_method || 'not selected' }}</dd></div>
            </dl>
          </section>

          <section class="reservation-detail-section">
            <div class="reservation-section-heading"><div><p class="eyebrow">Accommodation</p><h2>{{ hotelMode ? 'Booked type and assigned villa' : 'Selected villa' }}</h2></div><span v-if="reservation.villa_occupancy_status" class="occupancy-indicator" :class="`occupancy-${reservation.villa_occupancy_status}`">{{ reservation.villa_occupancy_status }}</span></div>
            <dl class="reservation-facts">
              <div v-if="hotelMode"><dt>Villa type</dt><dd>{{ reservation.villa_type_name || 'Not recorded' }}</dd></div>
              <div><dt>{{ hotelMode ? 'Assigned villa' : 'Villa' }}</dt><dd>{{ reservation.villa_name || (hotelMode ? 'Awaiting staff assignment' : 'Not recorded') }}</dd></div>
              <div v-if="hotelMode"><dt>Assigned by</dt><dd>{{ reservation.assigned_by_name || reservation.assigned_by_email || 'Not assigned' }}</dd></div>
              <div v-if="hotelMode"><dt>Assignment date</dt><dd>{{ dateTimeLabel(reservation.assigned_at) }}</dd></div>
            </dl>
          </section>

          <section class="reservation-detail-section">
            <div class="reservation-section-heading"><div><p class="eyebrow">Stay</p><h2>Dates and arrival</h2></div></div>
            <dl class="reservation-facts">
              <div><dt>Check-in date</dt><dd>{{ dateLabel(reservation.check_in) }} · {{ reservation.villa_check_in_time || reservation.type_check_in_time || '15:00' }}</dd></div>
              <div><dt>Check-out date</dt><dd>{{ dateLabel(reservation.check_out) }} · {{ reservation.villa_check_out_time || reservation.type_check_out_time || '11:00' }}</dd></div>
              <div><dt>Number of nights</dt><dd>{{ nights }}</dd></div>
              <div><dt>Number of guests</dt><dd>{{ reservation.guests }}</dd></div>
              <div><dt>Actual check-in</dt><dd>{{ dateTimeLabel(reservation.actual_check_in) }}<small v-if="reservation.checked_in_by_name">By {{ reservation.checked_in_by_name }}</small></dd></div>
              <div><dt>Actual check-out</dt><dd>{{ dateTimeLabel(reservation.actual_check_out) }}<small v-if="reservation.checked_out_by_name">By {{ reservation.checked_out_by_name }}</small></dd></div>
            </dl>
            <p v-if="reservation.guest_note" class="reservation-guest-note"><strong>Guest request</strong>{{ reservation.guest_note }}</p>
            <p v-if="reservation.check_in_remarks" class="reservation-guest-note"><strong>Check-in remarks</strong>{{ reservation.check_in_remarks }}</p>
            <p v-if="reservation.check_out_remarks" class="reservation-guest-note"><strong>Check-out remarks</strong>{{ reservation.check_out_remarks }}</p>
          </section>

          <section class="reservation-detail-section reservation-activity-section">
            <div class="reservation-section-heading"><div><p class="eyebrow">Audit trail</p><h2>Booking activity</h2></div></div>
            <ol v-if="reservation.activity?.length" class="reservation-activity-list">
              <li v-for="event in reservation.activity" :key="event.id">
                <span class="activity-mark" aria-hidden="true"></span>
                <div><strong>{{ activityLabel(event.action) }}</strong><small>{{ dateTimeLabel(event.occurred_at) }} · By {{ event.staff_name || event.staff_email || (event.action === 'booking-requested' ? 'Guest' : 'System') }}</small><small v-if="event.event_villa_name">Villa · {{ event.event_villa_name }}</small><p v-if="event.remarks">{{ event.remarks }}</p></div>
              </li>
            </ol>
            <p v-else class="empty-state">No booking activity recorded.</p>
          </section>
        </div>

        <aside class="reservation-detail-side">
          <section class="reservation-detail-section reservation-total-section">
            <p class="eyebrow">Current account</p><h2>{{ formatCurrency(statement?.total ?? reservation.total_amount) }}</h2>
            <dl><div><dt>Payment status</dt><dd>{{ reservation.payment_status || 'unpaid' }}</dd></div><div><dt>Outstanding</dt><dd>{{ formatCurrency(statement?.balance || 0) }}</dd></div></dl>
          </section>
          <section class="reservation-detail-section reservation-email-section">
            <div class="reservation-section-heading"><div><p class="eyebrow">Guest communication</p><h2>Email history</h2></div></div>
            <div v-if="reservation.emails?.length" class="reservation-email-list">
              <div v-for="email in reservation.emails" :key="email.id"><span>{{ email.template.replaceAll('-', ' ') }}</span><strong :class="`email-${email.status}`">{{ email.status }}</strong><small>{{ email.sentAt ? dateTimeLabel(email.sentAt) : email.attemptedAt ? `Attempted ${dateTimeLabel(email.attemptedAt)}` : 'Not sent' }}</small><small v-if="email.errorMessage" class="email-error">{{ email.errorMessage }}</small></div>
            </div>
            <p v-else class="empty-state">No email attempts recorded.</p>
            <div v-if="canOperate" class="reservation-email-actions">
              <button v-if="['confirmed', 'checked_in', 'checked_out'].includes(reservation.booking_status)" type="button" :disabled="saving" @click="resendEmail('confirmed')">Resend confirmation</button>
              <button v-if="['checked_in', 'checked_out'].includes(reservation.booking_status)" type="button" :disabled="saving" @click="resendEmail('checkin')">Resend check-in email</button>
              <button v-if="reservation.booking_status === 'checked_out'" type="button" :disabled="saving" @click="resendEmail('checkout')">Resend check-out email</button>
            </div>
          </section>
        </aside>
      </div>

      <ReservationStatementPanel :reservation="reservation" :read-only="closedReservation" />
    </section>

    <section v-else class="reservation-detail-layout"><p class="management-error" role="alert">{{ error || 'Reservation not found' }}</p><button class="dashboard-primary" type="button" @click="backToCalendar">Return to reservations</button></section>

    <div v-if="activeDialog" class="reservation-modal-backdrop" @click.self="activeDialog = ''">
      <section class="reservation-action-dialog" role="dialog" aria-modal="true" :aria-labelledby="`dialog-${activeDialog}-title`">
        <button class="reservation-dialog-close" type="button" aria-label="Close dialog" @click="activeDialog = ''">×</button>
        <template v-if="activeDialog === 'confirm'">
          <p class="eyebrow">Review before confirmation</p><h2 id="dialog-confirm-title">Confirm this booking?</h2>
          <dl class="reservation-dialog-summary"><div><dt>Reference</dt><dd>{{ reservation.reference_number }}</dd></div><div><dt>Guest</dt><dd>{{ reservation.guest_name }} · {{ reservation.guests }} guests</dd></div><div><dt>Stay</dt><dd>{{ dateLabel(reservation.check_in) }} to {{ dateLabel(reservation.check_out) }}</dd></div><div><dt>Accommodation</dt><dd>{{ reservation.villa_type_name || reservation.villa_name }}<span v-if="reservation.villa_name && hotelMode"> · {{ reservation.villa_name }}</span></dd></div><div><dt>Amount / payment</dt><dd>{{ formatCurrency(statement?.total ?? reservation.total_amount) }} · {{ reservation.payment_status }}</dd></div></dl>
          <p class="reservation-dialog-note">The reservation will move to Confirmed. The guest will receive a confirmation email; email delivery failures will be logged and can be retried.</p>
          <div class="reservation-dialog-actions"><button type="button" class="button button-quiet" @click="activeDialog = ''">Back</button><button type="button" class="button button-sun" :disabled="saving" @click="confirmBooking">{{ saving ? 'Confirming...' : 'Confirm booking' }}</button></div>
        </template>
        <template v-else-if="activeDialog === 'assign'">
          <p class="eyebrow">Room assignment</p><h2 id="dialog-assign-title">Assign a villa</h2><p class="reservation-dialog-note">{{ reservation.villa_type_name }} · {{ reservation.reference_number }} · {{ dateLabel(reservation.check_in) }} to {{ dateLabel(reservation.check_out) }}</p>
          <label class="reservation-dialog-field">Available villas<select v-model="selectedVillaId" required><option value="" disabled>Select a villa</option><option v-for="villa in assignableVillas" :key="villa.id" :value="villa.id">{{ villa.name }} · up to {{ villa.capacity }} guests</option></select></label>
          <p v-if="!assignableVillas.length" class="reservation-dialog-warning">No villas of this type are available across the full stay dates.</p>
          <p v-else-if="selectedVilla" class="reservation-dialog-note">{{ reservation.villa_id ? 'Change assignment to' : 'Assign' }} <strong>{{ selectedVilla.name }}</strong> to {{ reservation.guest_name }}?</p>
          <div class="reservation-dialog-actions"><button type="button" class="button button-quiet" @click="activeDialog = ''">Back</button><button type="button" class="button button-sun" :disabled="saving || !selectedVillaId" @click="assignVilla">{{ saving ? 'Assigning...' : 'Save assignment' }}</button></div>
        </template>
        <template v-else-if="activeDialog === 'check-in'">
          <p class="eyebrow">Arrival verification</p><h2 id="dialog-check-in-title">Check in guest</h2>
          <dl class="reservation-dialog-summary"><div><dt>Reference</dt><dd>{{ reservation.reference_number }}</dd></div><div><dt>Guest / contact</dt><dd>{{ reservation.guest_name }} · {{ reservation.guest_email }}</dd></div><div><dt>Guests</dt><dd>{{ reservation.guests }}</dd></div><div><dt>Stay</dt><dd>{{ dateLabel(reservation.check_in) }} to {{ dateLabel(reservation.check_out) }}</dd></div><div><dt>Villa type</dt><dd>{{ reservation.villa_type_name || 'Specific villa booking' }}</dd></div><div><dt>Assigned villa</dt><dd>{{ reservation.villa_name || 'Not assigned' }}</dd></div><div><dt>Payment status</dt><dd>{{ reservation.payment_status }} · {{ formatCurrency(statement?.balance || 0) }} due</dd></div></dl>
          <p v-if="reservation.guest_note" class="reservation-dialog-note"><strong>Special requests:</strong> {{ reservation.guest_note }}</p>
          <label class="reservation-dialog-field">Arrival remarks<textarea v-model="checkInRemarks" rows="3" maxlength="1000" placeholder="ID checked, arrival notes, key handover..."></textarea></label>
          <p class="reservation-dialog-note">This records the actual check-in time and staff member, marks the villa occupied, and adds an audit event.</p>
          <div class="reservation-dialog-actions"><button type="button" class="button button-quiet" @click="activeDialog = ''">Back</button><button type="button" class="button button-sun" :disabled="saving" @click="checkIn">{{ saving ? 'Checking in...' : 'Complete check-in' }}</button></div>
        </template>
        <template v-else>
          <p class="eyebrow">Departure review</p><h2 id="dialog-check-out-title">Check out guest</h2>
          <dl class="reservation-dialog-summary"><div><dt>Guest / reference</dt><dd>{{ reservation.guest_name }} · {{ reservation.reference_number }}</dd></div><div><dt>Assigned villa</dt><dd>{{ reservation.villa_name || 'Specific villa' }}</dd></div><div><dt>Actual check-in</dt><dd>{{ dateTimeLabel(reservation.actual_check_in) }}</dd></div><div><dt>Scheduled check-out</dt><dd>{{ dateLabel(reservation.check_out) }} · {{ reservation.villa_check_out_time || reservation.type_check_out_time || '11:00' }}</dd></div><div><dt>Nights</dt><dd>{{ nights }}</dd></div><div><dt>Booking amount</dt><dd>{{ formatCurrency(statement?.roomTotal || 0) }}</dd></div><div><dt>Included pre-booked items</dt><dd>{{ formatCurrency(statement?.includedChargesTotal || 0) }}</dd></div><div><dt>Additional charges</dt><dd>{{ formatCurrency(statement?.chargesTotal || 0) }}</dd></div><div><dt>Discounts</dt><dd>{{ formatCurrency(0) }}</dd></div><div><dt>Payments</dt><dd>{{ formatCurrency(statement?.paymentsTotal || 0) }}</dd></div><div class="dialog-balance"><dt>Outstanding balance</dt><dd>{{ formatCurrency(statement?.balance || 0) }}</dd></div></dl>
          <p v-if="statement?.charges?.length" class="reservation-dialog-note"><strong>Charges:</strong> {{ statement.charges.map((charge) => `${charge.description} × ${charge.quantity}`).join(', ') }}</p>
          <p v-if="statement?.balance > 0.005" class="reservation-dialog-warning">Settle the outstanding balance before completing check-out. Record payment in the statement below.</p>
          <label class="reservation-dialog-field">Departure remarks<textarea v-model="checkOutRemarks" rows="3" maxlength="1000" placeholder="Final inspection, key return, guest feedback..."></textarea></label>
          <div class="reservation-dialog-actions"><button type="button" class="button button-quiet" @click="activeDialog = ''">Back</button><button type="button" class="button button-sun" :disabled="saving || (statement?.balance || 0) > 0.005" @click="checkOut">{{ saving ? 'Checking out...' : 'Complete check-out' }}</button></div>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.reservation-detail-page { width: 100%; max-width: none; }
.reservation-detail-layout { display: grid; gap: 22px; width: min(100%, 1600px); margin: 0 auto; padding-bottom: 40px; }
.reservation-detail-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 0 22px; border-bottom: 1px solid #dce4dc; }
.reservation-detail-header h1 { margin: 5px 0; color: #173d3a; font: 400 38px/1.1 Georgia,serif; }
.reservation-detail-header p:last-child { margin: 0; color: #64756e; }
.reservation-detail-status { flex: 0 0 auto; padding: 9px 12px; border: 1px solid #d5ded6; color: #173d3a; text-transform: capitalize; font-size: 13px; }
.status-pending { background: #fff6e4; border-color: #ead39b; }.status-confirmed { background: #eaf5f1; }.status-checked_in { background: #e5f2eb; }.status-checked_out { background: #eef0eb; }.status-cancelled,.status-no_show { background: #fff0eb; border-color: #efcbbf; }
.reservation-detail-notice { margin: 0; padding: 12px 14px; border-left: 3px solid #176059; background: #edf5f0; color: #176059; }
.reservation-detail-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
.reservation-detail-actions button,.reservation-email-actions button { min-height: 40px; padding: 9px 14px; border: 1px solid #176059; background: #176059; color: #fff; cursor: pointer; font: 600 13px Arial,sans-serif; }
.reservation-detail-actions button:hover,.reservation-email-actions button:hover { background: #124d47; }.reservation-detail-actions button:disabled,.reservation-email-actions button:disabled { opacity: .55; cursor: wait; }
.reservation-detail-actions .danger-action { border-color: #b65e49; background: #fff; color: #9d4b38; }.reservation-detail-actions .danger-action:hover { background: #fff0eb; }
.reservation-assignment-warning { display: inline-flex; align-items: center; border: 1px solid #e8d1a0; border-radius: 999px; background: #fff8e8; padding: 7px 10px; color: #945d18; font-size: 12px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
.reservation-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.reservation-summary-card { display: grid; gap: 6px; border: 1px solid #dfe8df; background: linear-gradient(180deg, #ffffff 0%, #f8faf8 100%); padding: 16px 18px; }
.reservation-summary-card span { color: #7d8a81; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.reservation-summary-card strong { color: #173d3a; font-size: 1.05rem; }
.reservation-summary-card small { color: #64756d; font-size: 12px; }
.accent-card { border-color: #d9c69a; background: linear-gradient(180deg, #fffaf0 0%, #fff7e8 100%); }
.accent-card strong { color: #955b1d; }
.reservation-detail-columns { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(270px,.8fr); gap: 22px; align-items: start; }
.reservation-detail-main,.reservation-detail-side { display: grid; gap: 18px; min-width: 0; }
.reservation-detail-section { padding: 19px 20px; border: 1px solid #dce4dc; background: #fffdf8; }
.reservation-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 15px; }
.reservation-section-heading h2,.reservation-total-section h2,.reservation-action-dialog h2 { margin: 3px 0 0; color: #173d3a; font: 400 24px/1.2 Georgia,serif; }
.reservation-facts { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px 22px; margin: 0; }
.reservation-facts div,.reservation-total-section dl div { display: grid; gap: 5px; min-width: 0; }
.reservation-facts dt,.reservation-total-section dt,.reservation-dialog-summary dt { color: #7b8881; font: 11px/1.4 Arial,sans-serif; text-transform: uppercase; }
.reservation-facts dd,.reservation-total-section dd,.reservation-dialog-summary dd { margin: 0; color: #193f3b; font: 600 14px/1.45 Arial,sans-serif; overflow-wrap: anywhere; }
.reservation-facts dd a { color: inherit; text-decoration-color: #b9c5bc; }.reservation-facts dd small { display: block; margin-top: 4px; color: #78877f; font-weight: 400; }
.capitalize { text-transform: capitalize; }
.occupancy-indicator { padding: 5px 8px; border: 1px solid #d7e3d8; color: #176059; font-size: 11px; text-transform: capitalize; }.occupancy-occupied { border-color: #dcae76; color: #9a6128; background: #fff6e7; }
.reservation-guest-note { display: grid; gap: 5px; margin: 16px 0 0; padding-top: 12px; border-top: 1px solid #e8ece6; color: #52615a; font-size: 13px; line-height: 1.55; }.reservation-guest-note strong { color: #193f3b; }
.reservation-total-section h2 { margin: 4px 0 16px; font-size: 30px; }.reservation-total-section dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0; padding-top: 13px; border-top: 1px solid #e1e6df; }.reservation-total-section dd { text-transform: capitalize; }
.reservation-activity-list { position: relative; display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }.reservation-activity-list li { position: relative; display: grid; grid-template-columns: 14px minmax(0,1fr); gap: 12px; padding: 0 0 18px; }.reservation-activity-list li:not(:last-child)::after { position: absolute; top: 11px; bottom: -1px; left: 5px; width: 1px; background: #d9e2da; content: ''; }.activity-mark { z-index: 1; width: 11px; height: 11px; margin-top: 3px; border: 2px solid #176059; border-radius: 50%; background: #fffdf8; }.reservation-activity-list li strong { display: block; color: #173d3a; font-size: 14px; text-transform: capitalize; }.reservation-activity-list small { display: block; margin-top: 4px; color: #7b8881; font-size: 11px; line-height: 1.45; }.reservation-activity-list p { margin: 7px 0 0; color: #52615a; font-size: 12px; line-height: 1.5; }
.reservation-email-list { display: grid; gap: 10px; }.reservation-email-list>div { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 5px 8px; padding-bottom: 10px; border-bottom: 1px solid #e7ebe5; }.reservation-email-list span { color: #344d46; font-size: 12px; text-transform: capitalize; }.reservation-email-list strong { font-size: 11px; text-transform: capitalize; }.reservation-email-list small { grid-column: 1 / -1; color: #849089; font-size: 11px; }.email-sent { color: #176059; }.email-failed { color: #a54f3a; }.email-error { color: #a54f3a !important; }
.reservation-email-actions { display: grid; gap: 7px; margin-top: 14px; }.reservation-email-actions button { width: 100%; min-height: 36px; background: #fffdf8; color: #176059; }.reservation-email-actions button:hover { color: #fff; }
.reservation-modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(17 35 32 / 58%); }
.reservation-action-dialog { position: relative; width: min(100%,560px); max-height: min(90vh,850px); overflow: auto; padding: 28px; border: 1px solid #d7ded5; background: #fffdf8; box-shadow: 0 20px 70px rgb(15 38 33 / 25%); }
.reservation-dialog-close { position: absolute; top: 11px; right: 12px; width: 34px; height: 34px; border: 1px solid #dce4dc; background: transparent; color: #176059; cursor: pointer; font-size: 22px; }
.reservation-dialog-summary { display: grid; gap: 11px; margin: 20px 0 0; }.reservation-dialog-summary div { display: grid; grid-template-columns: minmax(115px,.7fr) minmax(0,1.3fr); gap: 10px; padding-bottom: 9px; border-bottom: 1px solid #e7ebe5; }.reservation-dialog-summary dd { font-size: 13px; }.reservation-dialog-summary dd span { display: block; margin-top: 2px; color: #76847d; font-weight: 400; }.reservation-dialog-summary .dialog-balance dd { color: #a14d37; font-size: 16px; }
.reservation-dialog-note,.reservation-dialog-warning { margin: 16px 0 0; color: #63736b; font: 13px/1.6 Arial,sans-serif; }.reservation-dialog-warning { padding: 10px 12px; border-left: 3px solid #bd644e; background: #fff1ec; color: #914533; }
.reservation-dialog-field { display: grid; gap: 7px; margin-top: 19px; color: #52615a; font: 600 13px Arial,sans-serif; }.reservation-dialog-field select,.reservation-dialog-field textarea { width: 100%; padding: 11px 12px; border: 1px solid #d7e0d8; background: #fff; color: #173d3a; font: 14px Arial,sans-serif; }.reservation-dialog-field textarea { resize: vertical; }
.reservation-dialog-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 24px; }.reservation-dialog-actions .button { min-height: 42px; padding: 10px 15px; border: 1px solid #176059; cursor: pointer; }.reservation-dialog-actions .button-quiet { background: transparent; color: #176059; }.reservation-dialog-actions .button-sun { background: #c89539; color: #fff; }.reservation-dialog-actions .button:disabled { opacity: .55; cursor: wait; }
@media (max-width: 800px) { .reservation-detail-columns { grid-template-columns: 1fr; }.reservation-detail-header { align-items: flex-start; }.reservation-facts { gap: 12px; } }
@media (max-width: 520px) { .reservation-detail-header h1 { font-size: 30px; }.reservation-detail-header { flex-direction: column; }.reservation-facts { grid-template-columns: 1fr; }.reservation-detail-section { padding: 16px; }.reservation-action-dialog { padding: 23px 18px; }.reservation-dialog-summary div { grid-template-columns: 105px minmax(0,1fr); }.reservation-dialog-actions { flex-direction: column-reverse; }.reservation-dialog-actions .button { width: 100%; } }
</style>
