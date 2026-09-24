<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { villaService } from '@/services/villaService';
import { serviceService } from '@/services/serviceService';
import { menuService } from '@/services/menuService';
import { authService } from '@/services/authService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';
import BookingVillaDetails from '@/components/BookingVillaDetails.vue';
import BookingCostSummary from '@/components/BookingCostSummary.vue';

const villas = ref([]);
const route = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const allVillas = ref([]);
const villaTypes = ref([]);
const services = ref([]);
const menuItems = ref([]);
const operatingMode = ref('airbnb');
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const reservation = ref(null);
const verification = reactive({ challengeId: '', token: '', code: '', sent: false, verified: false, loading: false, error: '', devCode: '' });
const pricingEstimate = ref(null);
const today = new Date().toISOString().slice(0, 10);
const minimumCheckOut = computed(() => {
  if (!form.checkIn) return today;
  const nextDay = new Date(`${form.checkIn}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return nextDay.toISOString().slice(0, 10);
});
const calendarMonth = ref(new Date(`${today.slice(0, 7)}-01T00:00:00Z`));
const calendarRates = ref({});
const calendarUnavailableDates = ref([]);
const calendarLoading = ref(false);
const serviceQuantities = reactive({});
const menuQuantities = reactive({});
const currentStep = ref(1);
const steps = ['Stay & dates', 'Customize', 'Payment', 'Verify'];
const form = reactive({ villaId: '', villaTypeId: '', bookingKind: 'overnight', checkIn: '', checkOut: '', guests: 2, guestName: '', guestEmail: '', guestNote: '', serviceIds: [], menuItemIds: [], paymentMethod: 'card' });
const selectedVilla = computed(() => villas.value.find((villa) => String(villa.id) === String(form.villaId)) || null);
const isAuthenticated = computed(() => Boolean(user.value));
const requiresVerification = computed(() => !user.value?.emailVerified);
const availableServices = computed(() => services.value.filter((service) => !service.dayTourOnly || form.bookingKind === 'day_tour'));
const bookingKinds = computed(() => {
  const villa = selectedVilla.value;
  if (villa?.villaType?.dayTourOnly) return ['day_tour'];
  if (villa?.pricingRules?.length) {
    const kinds = new Set(['both']);
    villa.pricingRules.forEach((rule) => kinds.add(rule.stayType));
    return ['overnight', 'day_tour'].filter((kind) => kinds.has(kind) || kinds.has('both'));
  }
  if (villa?.stayType === 'day_tour') return ['day_tour'];
  if (villa?.stayType === 'overnight') return ['overnight'];
  return ['overnight', 'day_tour'];
});
const calendarMonths = computed(() => [0, 1].map((offset) => { const date = new Date(calendarMonth.value); date.setUTCMonth(date.getUTCMonth() + offset); return createCalendarMonth(date); }));
const stayTotal = computed(() => {
  const nights = form.bookingKind === 'day_tour' ? 1 : Math.max(1, form.checkIn && form.checkOut ? Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000) : 1);
  return pricingEstimate.value?.stayTotal ?? Number(selectedVilla.value?.nightlyPrice || 0) * nights;
});
const total = computed(() => {
  const serviceTotal = services.value.filter((service) => form.serviceIds.includes(String(service.id))).reduce((sum, service) => sum + Number(service.price || 0) * Number(serviceQuantities[service.id] || 1), 0);
  const menuTotal = menuItems.value.filter((item) => form.menuItemIds.includes(String(item.id))).reduce((sum, item) => sum + Number(item.price || 0) * Number(menuQuantities[item.id] || 1), 0);
  return stayTotal.value + serviceTotal + menuTotal;
});
const servicesTotal = computed(() => services.value.filter((service) => form.serviceIds.includes(String(service.id))).reduce((sum, service) => sum + Number(service.price || 0) * Number(serviceQuantities[service.id] || 1), 0));
const menuTotal = computed(() => menuItems.value.filter((item) => form.menuItemIds.includes(String(item.id))).reduce((sum, item) => sum + Number(item.price || 0) * Number(menuQuantities[item.id] || 1), 0));
const datesAvailable = computed(() => {
  if (!form.checkIn || (form.bookingKind === 'overnight' && !form.checkOut)) return false;
  if (form.bookingKind === 'overnight' && form.checkOut <= form.checkIn) return false;
  const end = form.bookingKind === 'day_tour' ? form.checkIn : form.checkOut;
  for (const cursor = new Date(`${form.checkIn}T00:00:00Z`); cursor < new Date(`${end}T00:00:00Z`) || (form.bookingKind === 'day_tour' && cursor.toISOString().slice(0, 10) === form.checkIn); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    if (calendarUnavailableDates.value.includes(cursor.toISOString().slice(0, 10))) return false;
  }
  return true;
});
function formatCalendarRate(value) { return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(value || 0)); }

function filterBookingVillas() {
  const requestedId = form.villaId?.toString() || route.query.villaId?.toString();
  const requestedTypeId = form.villaTypeId?.toString() || route.query.villaTypeId?.toString();
  const requestedVilla = allVillas.value.find((villa) => String(villa.id) === requestedId);
  const requestedType = villaTypes.value.find((type) => String(type.id) === requestedTypeId);
  const requestedKinds = getBookingKinds(requestedVilla || (requestedType ? { isVillaTypeOption: true, villaType: requestedType } : null));
  if (requestedVilla && !requestedKinds.includes(form.bookingKind)) form.bookingKind = requestedKinds[0];
  const visibleTypes = villaTypes.value
    .filter((type) => form.bookingKind === 'day_tour' || !type.dayTourOnly)
    .map((type) => ({ ...type, id: type.id, name: type.name, nightlyPrice: type.nightlyPrice, capacity: type.capacity, bedroomCount: type.bedroomCount, villaType: type, isVillaTypeOption: true }));
  const visibleVillas = allVillas.value.filter((villa) => (villa.stayType || 'both') === 'both' || villa.stayType === form.bookingKind || (form.bookingKind === 'day_tour' && villa.villaType?.dayTourOnly));
  villas.value = operatingMode.value === 'hotel' && visibleTypes.length ? visibleTypes : visibleVillas;
  const requested = villas.value.find((villa) => String(villa.id) === requestedId || (requestedTypeId && String(villa.villaType?.id) === requestedTypeId));
  if (requested || villas.value[0]) selectVilla(requested || villas.value[0]);
}
function getBookingKinds(villa) {
  if (villa?.villaType?.dayTourOnly) return ['day_tour'];
  if (villa?.pricingRules?.length) {
    const kinds = new Set(['both']);
    villa.pricingRules.forEach((rule) => kinds.add(rule.stayType));
    return ['overnight', 'day_tour'].filter((kind) => kinds.has(kind) || kinds.has('both'));
  }
  if (villa?.stayType === 'day_tour') return ['day_tour'];
  if (villa?.stayType === 'overnight') return ['overnight'];
  return ['overnight', 'day_tour'];
}
function selectVilla(villa) {
  if (!villa) return;
  const previousVilla = selectedVilla.value;
  const nextKinds = getBookingKinds(villa);
  form.villaId = villa.id;
  form.villaTypeId = villa.isVillaTypeOption ? villa.id : villa.villaType?.id || '';
  if (!nextKinds.includes(form.bookingKind) || (previousVilla?.villaType?.dayTourOnly && nextKinds.includes('overnight'))) form.bookingKind = nextKinds.includes('overnight') ? 'overnight' : nextKinds[0];
}
watch(() => form.bookingKind, filterBookingVillas);
watch(() => [form.villaId, form.villaTypeId], () => { if (!bookingKinds.value.includes(form.bookingKind)) form.bookingKind = bookingKinds.value[0]; });
watch(() => [form.villaId, form.villaTypeId, form.bookingKind, form.checkIn, form.checkOut], refreshPricing);
watch(() => [form.villaId, form.villaTypeId, form.bookingKind, calendarMonth.value], refreshCalendarRates);
watch(() => form.guestEmail, () => { verification.challengeId = ''; verification.token = ''; verification.code = ''; verification.sent = false; verification.verified = false; verification.error = ''; verification.devCode = ''; });
watch(() => verification.code, (code) => {
  if (code.length === 6 && verification.sent && !verification.verified && !verification.loading) verifyEmail();
});
watch([currentStep, requiresVerification], ([step, verificationRequired]) => {
  if (user.value) {
    form.guestName = user.value.displayName || user.value.email || '';
    form.guestEmail = user.value.email || '';
  }
  if (step === 4 && verificationRequired && form.guestEmail && !verification.sent && !verification.loading) sendVerification();
});

function createCalendarMonth(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const apiRate = calendarRates.value[value];
    return { value, day, rate: apiRate?.price ? apiRate : localPricingRate(value), disabled: value < today || calendarUnavailableDates.value.includes(value) };
  });
  return { key: `${year}-${month}`, label: new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(firstDay), leadingDays: firstDay.getUTCDay(), days };
}
function localPricingRate(date) {
  const rules = selectedVilla.value?.pricingRules || [];
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  const ruleType = day === 0 || day === 6 ? 'weekend' : 'weekday';
  const rule = rules.find((candidate) => (candidate.stayType === 'both' || candidate.stayType === form.bookingKind) && candidate.ruleType === ruleType);
  return rule ? { date, price: Number(rule.price || 0), ruleType: rule.ruleType, ruleName: rule.name } : null;
}
function shiftCalendarMonth(offset) { const next = new Date(calendarMonth.value); next.setUTCMonth(next.getUTCMonth() + offset); calendarMonth.value = next; }
function selectCalendarDate(date) {
  if (date < today || calendarUnavailableDates.value.includes(date)) return;
  if (!form.checkIn || form.checkOut || date <= form.checkIn) { form.checkIn = date; form.checkOut = ''; return; }
  form.checkOut = date;
}
function ensureAddonQuantity(quantities, id) { if (!quantities[id]) quantities[id] = 1; }
function requestErrorMessage(requestError) {
  const details = requestError.details?.details;
  if (Array.isArray(details) && details.length) return details.map((detail) => detail.message).join(' ');
  return requestError.message || 'Your booking could not be submitted.';
}
function formatReservationDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
function reservationDateLabel(booking) {
  const start = formatReservationDate(booking.checkIn);
  return booking.bookingKind === 'day_tour' || String(booking.checkIn).slice(0, 10) === String(booking.checkOut).slice(0, 10)
    ? start
    : `${start} - ${formatReservationDate(booking.checkOut)}`;
}
function paymentMethodLabel(value) {
  return ({ card: 'Credit / debit card', online: 'Online payment', bank_transfer: 'Bank transfer', pay_later: 'Pay later', cash: 'Cash' })[value] || value;
}
function nextStep() {
  if (currentStep.value === 1 && !datesAvailable.value) { error.value = 'Choose available dates before continuing.'; return; }
  error.value = '';
  currentStep.value = Math.min(4, currentStep.value + 1);
}
function previousStep() { error.value = ''; currentStep.value = Math.max(1, currentStep.value - 1); }
function handleBookingKeydown(event) {
  if (event.key !== 'Enter' || event.target?.autocomplete !== 'one-time-code') return;
  event.preventDefault();
  if (verification.code.length === 6 && !verification.loading) verifyEmail();
}
function calendarDateClass(day) {
  return { 'calendar-day-selected': day.value === form.checkIn || day.value === form.checkOut, 'calendar-day-in-range': form.checkIn && form.checkOut && day.value > form.checkIn && day.value < form.checkOut, 'calendar-day-unavailable': calendarUnavailableDates.value.includes(day.value), 'calendar-day-cheap': day.rate?.ruleType === 'weekday', 'calendar-day-expensive': ['weekend', 'holiday'].includes(day.rate?.ruleType) };
}
async function refreshCalendarRates() {
  if (!selectedVilla.value) return;
  calendarLoading.value = true;
  const start = calendarMonths.value[0]?.days[0]?.value;
  const endDate = new Date(calendarMonth.value);
  endDate.setUTCMonth(endDate.getUTCMonth() + 2, 1);
  const end = endDate.toISOString().slice(0, 10);
  try {
    const params = { bookingKind: form.bookingKind, villaId: selectedVilla.value.isVillaTypeOption ? '' : form.villaId, villaTypeId: selectedVilla.value.isVillaTypeOption ? form.villaTypeId : '', checkIn: start, checkOut: end };
    const [result, availability] = await Promise.all([villaService.pricing(params), villaService.availabilityCalendar({ bookingKind: form.bookingKind, villaId: params.villaId, villaTypeId: params.villaTypeId, startDate: start, endDate: end })]);
    calendarRates.value = Object.fromEntries((result.dailyRates || []).map((rate) => [rate.date, rate]));
    calendarUnavailableDates.value = availability.unavailableDates || [];
  } catch (_error) { calendarRates.value = {}; calendarUnavailableDates.value = []; } finally { calendarLoading.value = false; }
}

async function refreshPricing() {
  if (!selectedVilla.value || !form.checkIn || (form.bookingKind === 'overnight' && !form.checkOut)) { pricingEstimate.value = null; return; }
  try {
    pricingEstimate.value = await villaService.pricing({ bookingKind: form.bookingKind, villaId: selectedVilla.value.isVillaTypeOption ? '' : form.villaId, villaTypeId: selectedVilla.value.isVillaTypeOption ? form.villaTypeId : '', checkIn: form.checkIn, checkOut: form.bookingKind === 'day_tour' ? form.checkIn : form.checkOut });
  } catch (_error) { pricingEstimate.value = null; }
}

async function load() {
  try {
    const [villaResult, serviceResult, menuResult, configResult, typeResult] = await Promise.all([villaService.listPublic(), serviceService.listPublic(), menuService.listPublic(), villaService.getPublicConfig(), villaService.listPublicTypes()]);
    operatingMode.value = configResult.config.operatingMode;
    if (user.value) {
      form.guestName = user.value.displayName || user.value.email || '';
      form.guestEmail = user.value.email || '';
    }
    allVillas.value = villaResult.villas;
    services.value = serviceResult.services;
    menuItems.value = menuResult.menuItems;
    villaTypes.value = typeResult.villaTypes;
    filterBookingVillas();
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}
async function sendVerification() {
  verification.loading = true;
  verification.error = '';
  verification.challengeId = '';
  verification.token = '';
  verification.code = '';
  verification.sent = false;
  verification.verified = false;
  verification.devCode = '';
  error.value = '';
  try { const result = await authService.sendBookingVerification(form.guestEmail); Object.assign(verification, { challengeId: result.challengeId, sent: true, devCode: result.devCode || '' }); } catch (requestError) { verification.error = requestError.message; } finally { verification.loading = false; }
}
async function verifyEmail() {
  verification.loading = true; verification.error = '';
  try { const result = await authService.verifyBookingEmail({ email: form.guestEmail, challengeId: verification.challengeId, code: verification.code }); verification.token = result.verificationToken; verification.verified = true; error.value = ''; } catch (requestError) { verification.error = requestError.message; } finally { verification.loading = false; }
}
async function submit() {
  if (!datesAvailable.value) {
    currentStep.value = 1;
    error.value = 'Choose a check-out date after check-in before continuing.';
    return;
  }
  if (requiresVerification.value && !verification.verified && verification.sent && verification.code.length === 6) await verifyEmail();
  if (requiresVerification.value && !verification.verified) {
    currentStep.value = 4;
    error.value = verification.error || 'Verify your email before payment.';
    return;
  }
  submitting.value = true; error.value = '';
  try {
    const usesVillaType = Boolean(selectedVilla.value?.isVillaTypeOption);
    const result = await villaService.book({ ...form, verificationToken: verification.token || undefined, villaId: usesVillaType ? null : Number(form.villaId), villaTypeId: usesVillaType ? Number(form.villaTypeId) : null, checkOut: form.bookingKind === 'day_tour' ? undefined : form.checkOut, serviceIds: form.serviceIds.map(Number), menuItemIds: form.menuItemIds.map(Number), serviceQuantities, menuQuantities, guests: Number(form.guests), totalAmount: total.value });
    reservation.value = result.reservation;
  } catch (requestError) {
    if (requestError.status === 403 && requestError.message === 'Verify your email before payment') {
      verification.verified = false;
      verification.token = '';
      verification.error = 'This verification has expired or no longer matches this email. Request a new code and verify it again.';
      currentStep.value = 4;
      error.value = verification.error;
    } else {
      error.value = requestErrorMessage(requestError);
    }
  } finally { submitting.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="booking-page">
    <header class="booking-page-header"><RouterLink class="brand" to="/"><img class="brand-logo" :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai"></RouterLink><RouterLink class="text-link" to="/">Back home</RouterLink></header>
    <section v-if="loading" class="booking-confirmation"><p class="eyebrow">Preparing your stay</p><h1>Loading availability...</h1></section>
    <section v-else-if="!reservation" class="booking-page-layout">
      <div class="booking-page-intro"><p class="eyebrow">{{ operatingMode === 'hotel' ? 'Hotel booking' : 'Private villa booking' }}</p><h1>Plan your<br><em>Bali stay.</em></h1><p>Select your stay, verify your email, and complete payment without creating an account.</p></div>
      <form class="booking-page-form" @submit.prevent="submit" @keydown="handleBookingKeydown">
        <div class="booking-form-heading"><p class="eyebrow">Complete your stay</p><h1>Plan your<br><em>Bali stay.</em></h1><p>Choose your dates, review the villa details, and send your booking request.</p></div><nav class="booking-stepper" aria-label="Booking steps"><button v-for="(step, index) in steps" :key="step" type="button" :class="{ active: currentStep === index + 1, complete: currentStep > index + 1 }" @click="index + 1 < currentStep ? currentStep = index + 1 : null"><span>{{ index + 1 }}</span>{{ step }}</button></nav>
        <div v-if="selectedVilla" class="booking-right-column"><BookingVillaDetails :villa="selectedVilla" /><BookingCostSummary v-if="currentStep === 2" :stay-total="stayTotal" :services-total="servicesTotal" :menu-total="menuTotal" :total="total" /></div>
        <p v-if="error" class="booking-error" role="alert">{{ error }}</p>
        <section v-if="selectedVilla" class="booking-villa-details"><div class="booking-villa-details-media"><img v-if="selectedVilla.photos?.[0]?.url" :src="resolveMediaUrl(selectedVilla.photos[0].url)" :alt="selectedVilla.name"><img v-else-if="selectedVilla.villaType?.defaultImageUrl" :src="resolveMediaUrl(selectedVilla.villaType.defaultImageUrl)" :alt="selectedVilla.name"><span v-else aria-hidden="true">✦</span></div><div class="booking-villa-details-copy"><p class="eyebrow">Your selected stay</p><h2>{{ selectedVilla.name }}</h2><p>{{ selectedVilla.location }} · {{ selectedVilla.capacity }} guests · {{ selectedVilla.bedroomCount }} bedrooms</p><small>{{ selectedVilla.description || 'A private Bersantai stay prepared for your arrival.' }}</small><div class="booking-villa-details-meta"><span>{{ formatCurrency(pricingEstimate?.nightlyPrice || selectedVilla.nightlyPrice) }}<small> base / night</small></span><span>Check-in {{ selectedVilla.standardCheckIn || selectedVilla.villaType?.standardCheckIn || '15:00' }}</span><span>Check-out {{ selectedVilla.standardCheckOut || selectedVilla.villaType?.standardCheckOut || '11:00' }}</span></div></div></section>
        <label v-if="currentStep === 1">{{ villas.some((villa) => villa.isVillaTypeOption) ? 'Villa Type' : 'Villa' }}<select v-model="form.villaId" required @change="selectVilla(selectedVilla)"><option v-for="villa in villas" :key="villa.id" :value="villa.id">{{ villa.name }}</option></select></label>
        <label v-if="currentStep === 1 && bookingKinds.length > 1">Stay type<select v-model="form.bookingKind"><option v-for="kind in bookingKinds" :key="kind" :value="kind">{{ kind === 'day_tour' ? 'Day Tour' : 'Overnight stay' }}</option></select></label><div v-else-if="currentStep === 1" class="booking-stay-type-fixed"><span>Stay type</span><strong>{{ bookingKinds[0] === 'day_tour' ? 'Day Tour' : 'Overnight stay' }}</strong></div>
        <div v-if="currentStep === 1" class="booking-columns"><label>Date<input v-model="form.checkIn" type="date" :min="today" required></label><label v-if="form.bookingKind === 'overnight'">Check-out<input v-model="form.checkOut" type="date" :min="minimumCheckOut" required></label></div>
        <section v-if="currentStep === 1" class="booking-rate-calendar" aria-labelledby="rate-calendar-title"><div class="booking-rate-calendar-heading"><div><p class="eyebrow">Rates by day</p><h2 id="rate-calendar-title">Choose your dates</h2><small>{{ form.checkOut ? 'Dates selected' : form.checkIn ? 'Select your check-out date' : 'Select a check-in date' }}</small></div><div class="booking-rate-calendar-actions"><button type="button" aria-label="Previous two months" :disabled="calendarLoading" @click="shiftCalendarMonth(-1)">‹</button><button type="button" aria-label="Next two months" @click="shiftCalendarMonth(1)">›</button></div></div><div class="booking-rate-calendar-months"><div v-for="month in calendarMonths" :key="month.key" class="booking-rate-month"><h3>{{ month.label }}</h3><div class="booking-rate-weekdays"><span v-for="weekday in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="weekday">{{ weekday }}</span></div><div class="booking-rate-days"><span v-for="index in month.leadingDays" :key="`empty-${index}`" class="booking-rate-day-empty"></span><button v-for="day in month.days" :key="day.value" type="button" class="booking-rate-day" :class="calendarDateClass(day)" :disabled="day.disabled" @click="selectCalendarDate(day.value)"><span>{{ day.day }}</span><strong>{{ day.rate ? formatCalendarRate(day.rate.price) : '—' }}</strong></button></div></div></div><p class="booking-rate-calendar-legend"><span class="calendar-legend-cheap"></span> Lower rate <span class="calendar-legend-high"></span> Peak rate <span class="calendar-legend-blocked"></span> Booked</p></section>
        <label v-if="currentStep === 1">Guests<input v-model="form.guests" type="number" min="1" :max="selectedVilla?.capacity || 20" required></label>
        <div v-if="currentStep === 1" class="booking-step-actions"><span>Step 1 of 4</span><button class="button button-dark" type="button" @click="nextStep">Continue to customize <span aria-hidden="true">→</span></button></div>
        <section v-if="currentStep === 2" class="booking-addons-panel"><div class="booking-addons-heading"><p class="eyebrow">Make it yours</p><h2>Customize your stay</h2><p>Add services, meals, and small comforts before you send the request.</p></div><fieldset class="booking-services"><legend>Additional services</legend><label v-for="service in availableServices" :key="service.id" class="service-option"><input v-model="form.serviceIds" type="checkbox" :value="String(service.id)" @change="ensureAddonQuantity(serviceQuantities, service.id)"><span>{{ service.title }}</span><input v-if="form.serviceIds.includes(String(service.id))" v-model.number="serviceQuantities[service.id]" class="addon-quantity" type="number" min="1" aria-label="Service quantity"><strong>{{ formatCurrency(Number(service.price) * Number(serviceQuantities[service.id] || 1)) }}</strong></label><p v-if="!availableServices.length" class="booking-option-note">Services are not available right now.</p></fieldset><fieldset class="booking-services"><legend>Menu</legend><label v-for="item in menuItems" :key="item.id" class="service-option"><input v-model="form.menuItemIds" type="checkbox" :value="String(item.id)" @change="ensureAddonQuantity(menuQuantities, item.id)"><span>{{ item.name }}<small v-if="item.mealOfDay">{{ item.mealOfDay }}</small></span><input v-if="form.menuItemIds.includes(String(item.id))" v-model.number="menuQuantities[item.id]" class="addon-quantity" type="number" min="1" aria-label="Menu quantity"><strong>{{ formatCurrency(Number(item.price) * Number(menuQuantities[item.id] || 1)) }}</strong></label><p v-if="!menuItems.length" class="booking-option-note">Menu items are not available right now.</p></fieldset><label class="booking-note-field">Note for your host<textarea v-model="form.guestNote" rows="4" maxlength="1000" placeholder="Tell us about dietary needs, arrival details, or anything else we should prepare."></textarea></label><div class="booking-step-actions"><button class="button button-quiet" type="button" @click="previousStep">← Back</button><span>Step 2 of 4</span><button class="button button-dark" type="button" @click="nextStep">Continue to payment <span aria-hidden="true">→</span></button></div></section>
        <div v-if="currentStep === 3" class="booking-payment-step"><p class="eyebrow">Step 3</p><h2>Choose payment</h2><p>Select how you would like to settle your stay. Your final total is shown before confirmation.</p><fieldset class="booking-services"><legend>Payment method</legend><label v-for="method in [{ value: 'card', label: 'Credit / debit card' }, { value: 'online', label: 'Online payment' }, { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'pay_later', label: 'Pay later' }, { value: 'cash', label: 'Cash' } ]" :key="method.value" class="service-option"><input v-model="form.paymentMethod" type="radio" name="payment" :value="method.value"><span>{{ method.label }}</span></label></fieldset><div class="booking-summary"><span>Estimated total</span><strong>{{ formatCurrency(total) }}</strong></div><div class="booking-step-actions"><button class="button button-quiet" type="button" @click="previousStep">← Back</button><span>Step 3 of 4</span><button class="button button-dark" type="button" @click="nextStep">Continue to verification <span aria-hidden="true">→</span></button></div></div>
        <section v-if="currentStep === 4" class="booking-verification-step"><div class="booking-verification-panel"><div><p class="eyebrow">Step 4 · Nearly there</p><h2>Verify your email</h2><p>{{ requiresVerification ? (isAuthenticated ? 'A six-digit code was sent to your account email.' : 'We will send a six-digit code to confirm this booking request.') : 'Your account email is verified.' }}</p></div><template v-if="!isAuthenticated"><label>Your name<input v-model="form.guestName" autocomplete="name" required></label><label>Email address<input v-model="form.guestEmail" type="email" required></label><button class="button button-dark" type="button" :disabled="verification.loading || !form.guestEmail" @click="sendVerification">{{ verification.sent ? 'Resend code' : 'Send verification code' }}</button></template><small v-if="verification.devCode">Development code: {{ verification.devCode }}</small><label v-if="requiresVerification && verification.sent && !verification.verified">Verification code<input v-model="verification.code" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><button class="button button-dark" type="button" :disabled="verification.loading || verification.code.length !== 6" @click="verifyEmail">{{ verification.loading ? 'Verifying...' : 'Verify email' }}</button></label><p v-if="!requiresVerification || verification.verified" class="booking-availability">Email verified for this booking.</p><p v-if="verification.error" class="booking-error" role="alert">{{ verification.error }}</p></div><div class="booking-summary"><span>Estimated total</span><strong>{{ formatCurrency(total) }}</strong></div><div class="booking-step-actions"><button class="button button-quiet" type="button" @click="previousStep">← Back</button><span>Step 4 of 4</span><button class="button button-sun" type="submit" :disabled="submitting || verification.loading || (requiresVerification && !verification.verified) || !datesAvailable">{{ submitting ? 'Creating reservation...' : 'Complete payment & booking' }} <span aria-hidden="true">↗</span></button></div></section>
      </form>
    </section>
    <section v-else class="booking-confirmation booking-confirmation-page" aria-labelledby="booking-confirmation-title">
      <header class="confirmation-intro">
        <span class="booking-success-icon" aria-hidden="true">✓</span>
        <p class="eyebrow">Booking request received · {{ reservation.referenceNumber || reservation.id }}</p>
        <h1 id="booking-confirmation-title">Your stay is<br><em>on its way.</em></h1>
        <p>We have sent your request to our stay team. The details are below. A copy {{ reservation.confirmationEmailSent ? `has been emailed to ${reservation.guestEmail}` : 'could not be emailed right now' }}.</p>
      </header>
      <div v-if="!reservation.confirmationEmailSent" class="confirmation-email-notice" role="status">Your booking is saved. Please keep this reference number; email delivery is temporarily unavailable.</div>
      <section class="confirmation-details" aria-label="Booking details">
        <div class="confirmation-reference"><div><span>Booking reference</span><strong>{{ reservation.referenceNumber || reservation.id }}</strong></div><span class="confirmation-status">Pending review</span></div>
        <div class="confirmation-detail-grid">
          <div class="confirmation-stay"><span>Your stay</span><h2>{{ reservation.villaName }}</h2><p>{{ reservation.villaLocation }}</p></div>
          <div><span>Dates</span><strong>{{ reservationDateLabel(reservation) }}</strong><small v-if="reservation.bookingKind !== 'day_tour'">Check-in {{ selectedVilla?.standardCheckIn || selectedVilla?.villaType?.standardCheckIn || '15:00' }} · Check-out {{ selectedVilla?.standardCheckOut || selectedVilla?.villaType?.standardCheckOut || '11:00' }}</small></div>
          <div><span>Guests and stay</span><strong>{{ reservation.guests }} {{ reservation.guests === 1 ? 'guest' : 'guests' }} · {{ reservation.bookingKind === 'day_tour' ? 'Day tour' : 'Overnight stay' }}</strong></div>
          <div><span>Payment</span><strong>{{ paymentMethodLabel(reservation.paymentMethod) }}</strong><small>{{ reservation.paymentStatus === 'paid' ? 'Recorded as paid' : 'Payment pending' }}</small></div>
        </div>
        <div v-if="reservation.serviceItems?.length || reservation.menuItems?.length" class="confirmation-extras">
          <h2>Services and dining</h2>
          <div v-for="item in [...(reservation.serviceItems || []), ...(reservation.menuItems || [])]" :key="item.name" class="confirmation-extra-row"><span>{{ item.name }} × {{ item.quantity }}</span><strong>{{ formatCurrency(item.totalAmount) }}</strong></div>
        </div>
        <p v-if="reservation.guestNote" class="confirmation-note"><span>Your note</span>{{ reservation.guestNote }}</p>
        <div class="confirmation-total"><span>Estimated total</span><strong>{{ formatCurrency(reservation.totalAmount) }}</strong></div>
        <p class="confirmation-pending-note">This is a booking request. Your reservation is pending review by our stay team.</p>
      </section>
      <RouterLink class="button button-dark" to="/">Return home</RouterLink>
    </section>
  </main>
</template>
