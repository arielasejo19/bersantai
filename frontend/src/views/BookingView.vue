<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { villaService } from '@/services/villaService';
import { serviceService } from '@/services/serviceService';
import { authService } from '@/services/authService';
import { formatCurrency } from '@/services/currency';

const villas = ref([]);
const route = useRoute();
const allVillas = ref([]);
const villaTypes = ref([]);
const services = ref([]);
const operatingMode = ref('airbnb');
const loading = ref(true);
const checking = ref(false);
const submitting = ref(false);
const error = ref('');
const availabilityMessage = ref('');
const reservation = ref(null);
const verification = reactive({ challengeId: '', token: '', code: '', sent: false, verified: false, loading: false, error: '', devCode: '' });
const form = reactive({ villaId: '', villaTypeId: '', bookingKind: 'overnight', checkIn: '', checkOut: '', guests: 2, guestName: '', guestEmail: '', serviceIds: [], paymentMethod: 'card' });
const today = new Date().toISOString().slice(0, 10);
const selectedVilla = computed(() => villas.value.find((villa) => String(villa.id) === String(form.villaId)) || null);
const availableServices = computed(() => services.value.filter((service) => !service.dayTourOnly || form.bookingKind === 'day_tour'));
const total = computed(() => {
  const nights = form.bookingKind === 'day_tour' ? 1 : Math.max(1, form.checkIn && form.checkOut ? Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000) : 1);
  return Number(selectedVilla.value?.nightlyPrice || 0) * nights + services.value.filter((service) => form.serviceIds.includes(String(service.id))).reduce((sum, service) => sum + Number(service.price || 0), 0);
});

function filterBookingVillas() {
  const visibleTypes = villaTypes.value
    .filter((type) => form.bookingKind === 'day_tour' || !type.dayTourOnly)
    .map((type) => ({ ...type, id: type.id, name: type.name, nightlyPrice: type.nightlyPrice, capacity: type.capacity, bedroomCount: type.bedroomCount, villaType: type, isVillaTypeOption: true }));
  const visibleVillas = allVillas.value.filter((villa) => (villa.stayType || 'both') === 'both' || villa.stayType === form.bookingKind || (form.bookingKind === 'day_tour' && villa.villaType?.dayTourOnly));
  villas.value = visibleTypes.length ? visibleTypes : visibleVillas;
  const requestedId = route.query.villaId?.toString();
  const requestedTypeId = route.query.villaTypeId?.toString();
  const requested = villas.value.find((villa) => String(villa.id) === requestedId || (requestedTypeId && String(villa.villaType?.id) === requestedTypeId));
  if (requested || villas.value[0]) selectVilla(requested || villas.value[0]);
}
function selectVilla(villa) { if (!villa) return; form.villaId = villa.id; form.villaTypeId = villa.isVillaTypeOption ? villa.id : villa.villaType?.id || ''; }
watch(() => form.bookingKind, filterBookingVillas);

async function load() {
  try {
    const [villaResult, serviceResult, configResult, typeResult] = await Promise.all([villaService.listPublic(), serviceService.listPublic(), villaService.getPublicConfig(), villaService.listPublicTypes()]);
    operatingMode.value = configResult.config.operatingMode;
    allVillas.value = villaResult.villas;
    services.value = serviceResult.services;
    villaTypes.value = typeResult.villaTypes;
    filterBookingVillas();
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}
async function checkAvailability() {
  checking.value = true; error.value = ''; availabilityMessage.value = '';
  try {
    const result = await villaService.availability({ bookingKind: form.bookingKind, villaId: selectedVilla.value?.isVillaTypeOption ? null : form.villaId, villaTypeId: selectedVilla.value?.isVillaTypeOption ? form.villaTypeId : null, checkIn: form.checkIn, checkOut: form.bookingKind === 'day_tour' ? form.checkIn : form.checkOut });
    availabilityMessage.value = result.available ? 'This selection is available.' : 'This selection is unavailable for those dates.';
  } catch (requestError) { error.value = requestError.message; } finally { checking.value = false; }
}
async function sendVerification() {
  verification.loading = true; verification.error = '';
  try { const result = await authService.sendBookingVerification(form.guestEmail); Object.assign(verification, { challengeId: result.challengeId, sent: true, devCode: result.devCode || '' }); } catch (requestError) { verification.error = requestError.message; } finally { verification.loading = false; }
}
async function verifyEmail() {
  verification.loading = true; verification.error = '';
  try { const result = await authService.verifyBookingEmail({ email: form.guestEmail, challengeId: verification.challengeId, code: verification.code }); verification.token = result.verificationToken; verification.verified = true; } catch (requestError) { verification.error = requestError.message; } finally { verification.loading = false; }
}
async function submit() {
  if (!verification.verified) { error.value = 'Verify your email before payment.'; return; }
  submitting.value = true; error.value = '';
  try {
    const usesVillaType = Boolean(selectedVilla.value?.isVillaTypeOption);
    const result = await villaService.book({ ...form, verificationToken: verification.token, villaId: usesVillaType ? null : Number(form.villaId), villaTypeId: usesVillaType ? Number(form.villaTypeId) : null, serviceIds: form.serviceIds.map(Number), guests: Number(form.guests), totalAmount: total.value });
    reservation.value = result.reservation;
  } catch (requestError) { error.value = requestError.message; } finally { submitting.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="booking-page">
    <header class="booking-page-header"><RouterLink class="brand" to="/"><img class="brand-logo" :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai"></RouterLink><RouterLink class="text-link" to="/">Back home</RouterLink></header>
    <section v-if="loading" class="booking-confirmation"><p class="eyebrow">Preparing your stay</p><h1>Loading availability...</h1></section>
    <section v-else-if="!reservation" class="booking-page-layout">
      <div class="booking-page-intro"><p class="eyebrow">{{ operatingMode === 'hotel' ? 'Hotel booking' : 'Private villa booking' }}</p><h1>Plan your<br><em>Bali stay.</em></h1><p>Select your stay, verify your email, and complete payment without creating an account.</p></div>
      <form class="booking-page-form" @submit.prevent="submit">
        <p v-if="error" class="booking-error" role="alert">{{ error }}</p>
        <label>Stay type<select v-model="form.bookingKind"><option value="overnight">Overnight stay</option><option value="day_tour">Day Tour</option></select></label>
        <label>{{ villas.some((villa) => villa.isVillaTypeOption) ? 'Villa Type' : 'Villa' }}<select v-model="form.villaId" required @change="selectVilla(selectedVilla)"><option v-for="villa in villas" :key="villa.id" :value="villa.id">{{ villa.name }}</option></select></label>
        <div class="booking-columns"><label>Date<input v-model="form.checkIn" type="date" :min="today" required></label><label v-if="form.bookingKind === 'overnight'">Check-out<input v-model="form.checkOut" type="date" :min="form.checkIn || today" required></label></div>
        <label>Guests<input v-model="form.guests" type="number" min="1" :max="selectedVilla?.capacity || 20" required></label>
        <button class="button button-dark" type="button" :disabled="checking" @click="checkAvailability">{{ checking ? 'Checking...' : 'Check availability' }}</button>
        <p v-if="availabilityMessage" class="booking-availability">{{ availabilityMessage }}</p>
        <fieldset class="booking-services"><legend>Additional services</legend><label v-for="service in availableServices" :key="service.id" class="service-option"><input v-model="form.serviceIds" type="checkbox" :value="String(service.id)"><span>{{ service.title }}</span><strong>{{ formatCurrency(service.price) }}</strong></label></fieldset>
        <label>Your name<input v-model="form.guestName" autocomplete="name" required></label><label>Email address<input v-model="form.guestEmail" type="email" required></label>
        <div class="email-verification"><button class="button button-dark" type="button" :disabled="verification.loading || !form.guestEmail" @click="sendVerification">{{ verification.sent ? 'Resend verification code' : 'Send verification code' }}</button><small v-if="verification.devCode">Development code: {{ verification.devCode }}</small><label v-if="verification.sent && !verification.verified">Verification code<input v-model="verification.code" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><button class="button button-dark" type="button" :disabled="verification.loading" @click="verifyEmail">Verify email</button></label><p v-if="verification.verified" class="booking-availability">Email verified for this booking.</p><p v-if="verification.error" class="booking-error" role="alert">{{ verification.error }}</p></div>
        <fieldset class="booking-services"><legend>Payment method</legend><label v-for="method in [{ value: 'card', label: 'Credit / debit card' }, { value: 'online', label: 'Online payment' }, { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'cash', label: 'Cash' }]" :key="method.value" class="service-option"><input v-model="form.paymentMethod" type="radio" name="payment" :value="method.value"><span>{{ method.label }}</span></label></fieldset>
        <div class="booking-summary"><span>Estimated total</span><strong>{{ formatCurrency(total) }}</strong></div><button class="button button-sun" type="submit" :disabled="submitting || !verification.verified || availabilityMessage !== 'This selection is available.'">{{ submitting ? 'Creating reservation...' : 'Complete payment & booking' }} <span aria-hidden="true">↗</span></button>
      </form>
    </section>
    <section v-else class="booking-confirmation"><span class="booking-success-icon">✓</span><p class="eyebrow">Guest reservation received</p><h1>Your stay is<br><em>on its way.</em></h1><p>Reference <strong>{{ reservation.referenceNumber || reservation.id }}</strong>. A confirmation was queued for {{ reservation.guestEmail }}.</p><RouterLink class="button button-dark" to="/">Return home</RouterLink></section>
  </main>
</template>
