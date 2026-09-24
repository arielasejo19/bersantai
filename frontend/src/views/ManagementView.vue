<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { serviceService } from '@/services/serviceService';
import { villaService } from '@/services/villaService';
import { profileService } from '@/services/profileService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';
import MenuManagement from '@/components/MenuManagement.vue';
import PackageManagement from '@/components/PackageManagement.vue';
import MediaUploadField from '@/components/MediaUploadField.vue';
import ReservationWorkspace from '@/components/ReservationWorkspace.vue';
import PricingRulesManagement from '@/components/PricingRulesManagement.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { user } = storeToRefs(authStore);
const villas = ref([]);
const calendarVillas = ref([]);
const reservations = ref([]);
const allReservations = ref([]);
const selectedVilla = ref(null);
const search = ref('');
const managementViews = ['properties', 'map', 'reservations', 'pricing', 'villa-types', 'services', 'menus', 'packages', 'accounts', 'settings'];
const viewFromRoute = () => managementViews.includes(String(route.query.section)) ? String(route.query.section) : 'properties';
const activeView = ref(viewFromRoute());
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const showEditor = ref(false);
const showProfile = ref(false);
const accounts = ref([]);
const accountLoading = ref(false);
const accountSaving = ref(false);
const accountNotice = ref('');
const accountFilter = ref('all');
const accountForm = reactive({ email: '', displayName: '', role: 'receptionist', password: '' });
const profileForm = reactive({ displayName: '', bio: '', avatarUrl: '' });
const operatingMode = ref('airbnb');
const publicSite = reactive({ location: '', address: '', contactNumber: '', email: '', description: '', mapUrl: '' });
const mapUploading = ref(false);
const modeSaving = ref(false);
const modeNotice = ref('');
const hostAccounts = ref([]);
const services = ref([]);
const villaTypes = ref([]);
const villaTypeSaving = ref(false);
const villaTypeMediaFile = ref(null);
const selectedVillaType = ref(null);
const defaultAmenities = ['Wi-Fi', 'Air conditioning', 'Swimming pool', 'Fresh linens'];
const blankVillaType = () => ({ name: '', slug: '', description: '', isActive: true, dayTourOnly: false, defaultImageUrl: '', defaultMediaType: 'image', galleryUrls: [], nightlyPrice: 0, capacity: 2, bedroomCount: 1, status: 'active', availabilityStatus: 'available', amenities: [...defaultAmenities] });
const villaTypeForm = reactive(blankVillaType());
const serviceSaving = ref(false);
const serviceMediaFile = ref(null);
const selectedService = ref(null);
const blankService = () => ({ title: '', slug: '', description: '', price: 0, category: 'service', imageUrl: '', mediaType: 'image', isActive: true, dayTourOnly: false, sortOrder: 0 });
const serviceForm = reactive(blankService());

const blankVilla = () => ({ name: '', slug: '', location: '', villaTypeId: null, description: '', nightlyPrice: 0, capacity: 2, bedroomCount: 2, status: 'active', availabilityStatus: 'available', ownerUserId: null, amenities: [...defaultAmenities], photos: [] });
const form = reactive(blankVilla());
const isAdmin = computed(() => user.value?.role === 'admin');
const canEdit = computed(() => ['admin', 'host'].includes(user.value?.role));
const filteredVillas = computed(() => villas.value.filter((villa) => `${villa.name} ${villa.location}`.toLowerCase().includes(search.value.toLowerCase())));
const metrics = computed(() => [
  { label: 'Active listings', value: villas.value.filter((villa) => villa.status === 'active').length, detail: 'Published properties' },
  { label: 'Available tonight', value: villas.value.filter((villa) => villa.availabilityStatus === 'available').length, detail: 'Ready for guests' },
  { label: 'Upcoming stays', value: reservations.value.filter((reservation) => ['pending', 'confirmed'].includes(reservation.booking_status)).length, detail: 'Across selected villa' }
]);
const visibleAccounts = computed(() => accountFilter.value === 'all' ? accounts.value : accounts.value.filter((account) => account.role === accountFilter.value));
const isHotelMode = computed(() => operatingMode.value === 'hotel');
const modeName = computed(() => isHotelMode.value ? 'Hotel mode' : 'Airbnb mode');
const propertyLabel = computed(() => isHotelMode.value ? 'Rooms & suites' : 'Properties');
const propertySingular = computed(() => isHotelMode.value ? 'room' : 'property');

watch(activeView, (view) => {
  const section = view === 'properties' ? undefined : view;
  if (route.query.section === section) return;
  router.replace({ query: { ...route.query, section } });
});
watch(() => route.query.section, () => {
  const view = viewFromRoute();
  if (activeView.value !== view) activeView.value = view;
});

async function loadVillaTypes() {
  try { villaTypes.value = (await villaService.listTypes()).villaTypes; } catch (requestError) { error.value = requestError.message; }
}

function openVillaTypeCreate() { router.push({ name: 'villa-type-create' }); }

function openVillaTypeEdit(villaType) { router.push({ name: 'villa-type-edit', params: { resourceId: villaType.id } }); }

async function saveVillaType() {
  villaTypeSaving.value = true;
  error.value = '';
  try {
    const payload = { ...villaTypeForm, defaultImageUrl: villaTypeForm.defaultImageUrl.trim() || null, nightlyPrice: Number(villaTypeForm.nightlyPrice), capacity: Number(villaTypeForm.capacity), bedroomCount: Number(villaTypeForm.bedroomCount), amenities: villaTypeForm.amenities.filter((amenity) => amenity.trim()), galleryUrls: villaTypeForm.galleryUrls.filter((url) => url.trim()) };
    const result = selectedVillaType.value ? await villaService.updateType(selectedVillaType.value.id, payload) : await villaService.createType(payload);
    if (villaTypeMediaFile.value) { const data = new FormData(); data.append('media', villaTypeMediaFile.value); await villaService.uploadTypeMedia(result.villaType.id, data); }
    villaTypeMediaFile.value = null;
    openVillaTypeCreate();
    await loadVillaTypes();
  } catch (requestError) { error.value = requestError.message; } finally { villaTypeSaving.value = false; }
}

function addVillaTypeAmenity() { villaTypeForm.amenities.push(''); }
function removeVillaTypeAmenity(index) { villaTypeForm.amenities.splice(index, 1); }
function addVillaTypeImage() { villaTypeForm.galleryUrls.push(''); }
function removeVillaTypeImage(index) { villaTypeForm.galleryUrls.splice(index, 1); }

async function removeVillaType(villaType) {
  if (!window.confirm(`Remove ${villaType.name}?`)) return;
  try { await villaService.removeType(villaType.id); await loadVillaTypes(); } catch (requestError) { error.value = requestError.message; }
}

async function loadServices() {
  try { services.value = (await serviceService.list()).services; } catch (requestError) { error.value = requestError.message; }
}

function openServiceCreate() { router.push({ name: 'service-create' }); }

function openServiceEdit(service) { router.push({ name: 'service-edit', params: { resourceId: service.id } }); }

async function saveService() {
  serviceSaving.value = true;
  error.value = '';
  try {
    const payload = { ...serviceForm, sortOrder: Number(serviceForm.sortOrder) };
    const result = selectedService.value ? await serviceService.update(selectedService.value.id, payload) : await serviceService.create(payload);
    if (serviceMediaFile.value) { const data = new FormData(); data.append('media', serviceMediaFile.value); await serviceService.uploadMedia(result.service.id, data); }
    serviceMediaFile.value = null;
    openServiceCreate();
    await loadServices();
  } catch (requestError) { error.value = requestError.message; } finally { serviceSaving.value = false; }
}

async function removeService(service) {
  if (!window.confirm(`Remove ${service.title}?`)) return;
  try { await serviceService.remove(service.id); await loadServices(); } catch (requestError) { error.value = requestError.message; }
}

async function loadVillas() {
  loading.value = true;
  error.value = '';
  try {
    villas.value = (await villaService.list()).villas;
    if (villas.value.length && !selectedVilla.value) await selectVilla(villas.value[0]);
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}

async function loadMode() {
  try { const config = (await villaService.getConfig()).config; operatingMode.value = config.operatingMode; Object.assign(publicSite, config.publicSite || {}); } catch (requestError) { error.value = requestError.message; }
}

async function selectVilla(villa) {
  selectedVilla.value = villa;
  try { reservations.value = (await villaService.reservations(villa.id)).reservations; } catch (requestError) { error.value = requestError.message; }
}
async function loadAllReservations() {
  try { allReservations.value = (await villaService.allReservations()).reservations; } catch (requestError) { error.value = requestError.message; }
}
async function loadCalendarVillas() {
  try { calendarVillas.value = (await villaService.listCalendarVillas()).villas; } catch (requestError) { error.value = requestError.message; }
}

async function openCreate() {
  selectedVilla.value = null;
  if (isAdmin.value) await loadHostAccounts();
  await router.push({ name: 'villa-create' });
}

async function openEdit(villa) {
  Object.assign(form, { ...villa, villaTypeId: villa.villaType?.id || null, ownerUserId: villa.owner?.id || null });
  form.amenities = (villa.amenities || []).map((amenity) => amenity.name);
  form.photos = (villa.photos || []).map((photo) => ({ url: photo.url, mediaType: photo.mediaType || 'image', altText: photo.altText || '', isThumbnail: Boolean(photo.isThumbnail), sortOrder: photo.sortOrder || 0 }));
  selectedVilla.value = villa;
  if (isAdmin.value) await loadHostAccounts();
  await router.push({ name: 'villa-edit', params: { villaId: villa.id } });
}
async function archiveProperty(villa) {
  if (!window.confirm(`Archive ${villa.name}? It will be hidden from the public site but preserved in the system.`)) return;
  try { await villaService.archive(villa.id); if (selectedVilla.value?.id === villa.id) selectedVilla.value = null; await loadVillas(); } catch (requestError) { error.value = requestError.message; }
}

function addAmenityField() {
  form.amenities.push('');
}

function removeAmenityField(index) {
  form.amenities.splice(index, 1);
}

function addMediaField() {
  form.photos.push({ url: '', mediaType: 'image', altText: '', isThumbnail: form.photos.length === 0, sortOrder: form.photos.length });
}

function removeMediaField(index) {
  form.photos.splice(index, 1);
  if (form.photos.length && !form.photos.some((photo) => photo.isThumbnail)) form.photos[0].isThumbnail = true;
}

function setThumbnail(index) {
  form.photos.forEach((photo, photoIndex) => { photo.isThumbnail = photoIndex === index; });
}

async function saveVilla() {
  saving.value = true;
  error.value = '';
  const photos = form.photos.filter((photo) => photo.url.trim()).map((photo, index) => ({ ...photo, sortOrder: index }));
  if (photos.length && !photos.some((photo) => photo.isThumbnail)) photos[0].isThumbnail = true;
  const payload = { ...form, amenities: form.amenities.filter((amenity) => amenity.trim()), photos, nightlyPrice: Number(form.nightlyPrice), capacity: Number(form.capacity), bedroomCount: Number(form.bedroomCount) };
  try {
    if (selectedVilla.value?.id) await villaService.update(selectedVilla.value.id, payload);
    else await villaService.create(payload);
    showEditor.value = false;
    await loadVillas();
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}

async function changeVillaType(villa, typeId) {
  try {
    await villaService.update(villa.id, {
      name: villa.name,
      slug: villa.slug,
      location: villa.location,
      villaTypeId: typeId ? Number(typeId) : null,
      description: villa.description,
      nightlyPrice: Number(villa.nightlyPrice),
      capacity: Number(villa.capacity),
      bedroomCount: Number(villa.bedroomCount),
      status: villa.status,
      availabilityStatus: villa.availabilityStatus,
      ownerUserId: villa.owner?.id || null,
      amenities: (villa.amenities || []).map((amenity) => amenity.name || amenity),
      photos: (villa.photos || []).map((photo) => ({ url: photo.url, mediaType: photo.mediaType || 'image', altText: photo.altText || '', isThumbnail: Boolean(photo.isThumbnail), sortOrder: photo.sortOrder || 0 }))
    });
    await loadVillas();
  } catch (requestError) { error.value = requestError.message; }
}

async function updateStatus(reservation, status) {
  try { await villaService.updateReservation(selectedVilla.value.id, reservation.id, status); await selectVilla(selectedVilla.value); } catch (requestError) { error.value = requestError.message; }
}

async function assignIncomingReservation(reservation, villaId) {
  try { await villaService.assignReservation(reservation.id, villaId); await loadAllReservations(); } catch (requestError) { error.value = requestError.message; }
}

function openProfile() {
  Object.assign(profileForm, { displayName: user.value?.displayName || '', bio: user.value?.bio || '', avatarUrl: user.value?.avatarUrl || '' });
  showProfile.value = true;
}

async function logout() {
  await authStore.logout();
  await router.push({ name: 'login' });
}

async function saveProfile() {
  try {
    const result = await profileService.updateProfile(profileForm);
    authStore.user = { ...authStore.user, ...result.profile };
    showProfile.value = false;
  } catch (requestError) { error.value = requestError.message; }
}

async function loadAccounts() {
  accountLoading.value = true;
  try { accounts.value = (await villaService.listAccounts()).accounts; } catch (requestError) { error.value = requestError.message; } finally { accountLoading.value = false; }
}

async function loadHostAccounts() {
  try { hostAccounts.value = (await villaService.listAccounts()).accounts.filter((account) => account.role === 'host' && account.accountStatus === 'active'); } catch (requestError) { error.value = requestError.message; }
}

function openAccounts() {
  activeView.value = 'accounts';
  loadAccounts();
}

function resetAccountForm(role = 'receptionist') {
  Object.assign(accountForm, { email: '', displayName: '', role, password: '' });
}

async function createAccount() {
  accountSaving.value = true;
  error.value = '';
  try {
    const result = await villaService.inviteStaff({ ...accountForm, password: accountForm.password || undefined });
    resetAccountForm(accountForm.role);
    await loadAccounts();
    accountNotice.value = result.temporaryPassword
      ? `Account created. Temporary password: ${result.temporaryPassword}`
      : 'Invitation created. The host can now use their email to join.';
  } catch (requestError) { error.value = requestError.message; } finally { accountSaving.value = false; }
}

async function saveMode() {
  modeSaving.value = true;
  modeNotice.value = '';
  try {
    const config = (await villaService.updateConfig({ operatingMode: operatingMode.value, publicSite: { ...publicSite } })).config;
    operatingMode.value = config.operatingMode;
    Object.assign(publicSite, config.publicSite || {});
    modeNotice.value = `Saved. Bersantai is now running in ${modeName.value}.`;
  } catch (requestError) { error.value = requestError.message; } finally { modeSaving.value = false; }
}
function mapPosition(villa, index) { return { x: villa.mapX ?? 18 + ((index * 23) % 68), y: villa.mapY ?? 25 + ((index * 17) % 55) }; }
async function placeVillaOnMap(event) {
  if (!selectedVilla.value) { error.value = 'Select a villa before placing it on the map.'; return; }
  const rect = event.currentTarget.getBoundingClientRect();
  const mapX = Number(((event.clientX - rect.left) / rect.width * 100).toFixed(2));
  const mapY = Number(((event.clientY - rect.top) / rect.height * 100).toFixed(2));
  try { await villaService.updateMapPosition(selectedVilla.value.id, { mapX, mapY }); selectedVilla.value.mapX = mapX; selectedVilla.value.mapY = mapY; } catch (requestError) { error.value = requestError.message; }
}
async function uploadPublicMap(file) {
  mapUploading.value = true; error.value = '';
  try { const data = new FormData(); data.append('media', file); const result = await villaService.uploadPublicMap(data); Object.assign(publicSite, result.config.publicSite || {}); } catch (requestError) { error.value = requestError.message; } finally { mapUploading.value = false; }
}

onMounted(() => { loadVillas(); loadMode(); loadAllReservations(); loadCalendarVillas(); if (isAdmin.value) { loadServices(); loadVillaTypes(); } });
</script>

<template>
  <main class="dashboard-shell">
    <aside class="dashboard-sidebar management-sidebar">
      <div class="management-sidebar-nature" aria-hidden="true"><span class="host-leaf host-leaf-one"></span><span class="host-leaf host-leaf-two"></span><span class="host-leaf host-leaf-three"></span><span class="host-light host-light-one"></span><span class="thai-ornament thai-ornament-bottom"></span></div>
      <RouterLink class="dashboard-brand" to="/" aria-label="Back to Bersantai home"><img :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai Bali Private Resort"></RouterLink>
      <div class="sidebar-profile"><span class="avatar">{{ (user?.displayName || user?.email || 'B').charAt(0).toUpperCase() }}</span><div><strong>{{ user?.displayName || 'Partner' }}</strong><small>{{ user?.role }}</small></div></div>
      <nav class="dashboard-nav" aria-label="Management navigation"><button :class="{ active: activeView === 'properties' }" type="button" @click="activeView = 'properties'"><span>⌂</span> {{ propertyLabel }}</button><button v-if="isAdmin" :class="{ active: activeView === 'map' }" type="button" @click="activeView = 'map'"><span>⌖</span> Vicinity map</button><button :class="{ active: activeView === 'reservations' }" type="button" @click="activeView = 'reservations'"><span>▦</span> Reservations</button><button v-if="canEdit" :class="{ active: activeView === 'pricing' }" type="button" @click="activeView = 'pricing'"><span>₱</span> Flexible pricing</button><button v-if="isAdmin" :class="{ active: activeView === 'villa-types' }" type="button" @click="activeView = 'villa-types'"><span>▤</span> Villa Types</button><button v-if="isAdmin" :class="{ active: activeView === 'services' }" type="button" @click="activeView = 'services'"><span>✦</span> Services</button><button v-if="isAdmin" :class="{ active: activeView === 'menus' }" type="button" @click="activeView = 'menus'"><span>◈</span> Menus / Foods</button><button v-if="isAdmin" :class="{ active: activeView === 'packages' }" type="button" @click="activeView = 'packages'"><span>◇</span> Packages / Bundles</button><button v-if="isAdmin" :class="{ active: activeView === 'accounts' }" type="button" @click="openAccounts"><span>♙</span> Accounts</button><button v-if="isAdmin" :class="{ active: activeView === 'settings' }" type="button" @click="activeView = 'settings'"><span>⚙</span> Configuration</button></nav>
      <div class="sidebar-bottom"><button type="button" @click="openProfile">Account settings</button><RouterLink to="/">View public site</RouterLink><button type="button" @click="logout">Log out</button></div>
    </aside>

    <section class="dashboard-main">
      <header class="dashboard-topbar"><div><p class="eyebrow">{{ user?.role }} workspace</p><h1>{{ activeView === 'properties' ? 'Good morning, ' : '' }}{{ user?.displayName || 'Partner' }}</h1></div><div class="topbar-actions"><button class="notification-button" type="button" aria-label="Notifications">♧<i></i></button><button class="topbar-avatar" type="button" aria-label="Open profile" @click="openProfile">{{ (user?.displayName || 'B').charAt(0).toUpperCase() }}</button></div></header>
      <p v-if="error" class="management-error" role="alert">{{ error }}</p>
      <MediaUploadField v-if="activeView === 'villa-types'" :url="villaTypeForm.defaultImageUrl" :media-type="villaTypeForm.defaultMediaType" label="Villa type photo or video" @select="villaTypeMediaFile = $event" />
      <MediaUploadField v-if="activeView === 'services'" :url="serviceForm.imageUrl" :media-type="serviceForm.mediaType" label="Service photo or video" @select="serviceMediaFile = $event" />
      <MediaUploadField v-if="activeView === 'settings' && isAdmin" :url="publicSite.mapUrl" label="Public vicinity map" @select="uploadPublicMap" />
      <MenuManagement v-if="activeView === 'menus'" />
      <PackageManagement v-if="activeView === 'packages'" />
      <PricingRulesManagement v-if="activeView === 'pricing'" />
      <ReservationWorkspace v-if="activeView === 'reservations'" :reservations="allReservations" :villas="calendarVillas" @refresh="loadAllReservations" />
      <label v-if="activeView === 'properties' && isAdmin && selectedVilla" class="villa-type-quick-edit">Villa Type<select :value="selectedVilla.villaType?.id || ''" @change="changeVillaType(selectedVilla, $event.target.value)"><option value="">Unassigned</option><option v-for="villaType in villaTypes" :key="villaType.id" :value="villaType.id">{{ villaType.name }}</option></select></label>
      <template v-if="activeView === 'properties'">
        <div class="metric-grid"><article v-for="metric in metrics" :key="metric.label" class="metric-card"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small></article></div>
        <div class="dashboard-toolbar"><div><h2>Your {{ propertyLabel.toLowerCase() }}</h2><p>{{ isHotelMode ? 'Manage room inventory, housekeeping status, and guest stays.' : 'Keep your stays looking their best.' }}</p></div><div class="toolbar-actions"><label class="search-field"><span aria-hidden="true">⌕</span><input v-model="search" type="search" :placeholder="`Search ${propertyLabel.toLowerCase()}`"></label><button v-if="isAdmin" class="dashboard-primary" type="button" @click="openCreate">＋ Add {{ propertySingular }}</button></div></div>
        <div v-if="loading" class="empty-state">Loading your properties...</div><div v-else-if="!filteredVillas.length" class="empty-state"><strong>No properties found</strong><span>{{ search ? 'Try a different search.' : 'Your assigned properties will appear here.' }}</span></div><div v-else class="property-grid"><article v-for="villa in filteredVillas" :key="villa.id" class="property-card" :class="{ selected: selectedVilla?.id === villa.id }" @click="selectVilla(villa)"><div class="property-photo"><video v-if="villa.photos?.[0]?.mediaType === 'video'" :src="resolveMediaUrl(villa.photos[0].url)" muted preload="metadata" :aria-label="`${villa.name} video`"></video><img v-else-if="villa.photos?.[0]?.url" :src="resolveMediaUrl(villa.photos[0].url)" :alt="villa.name" loading="lazy"><div v-else class="property-photo-empty">No media</div><span :class="`availability-pill ${villa.availabilityStatus}`">{{ villa.availabilityStatus }}</span><button v-if="canEdit" class="card-edit" type="button" aria-label="Edit property" @click.stop="openEdit(villa)">⋯</button><button v-if="canEdit && villa.status !== 'inactive'" class="card-archive" type="button" aria-label="Archive property" @click.stop="archiveProperty(villa)">×</button></div><div class="property-info"><div><h3>{{ villa.name }}</h3><p>{{ villa.location }}</p></div><strong>{{ formatCurrency(villa.nightlyPrice) }}<small> / night</small></strong></div><div class="property-meta"><span>{{ villa.capacity }} guests</span><span>{{ villa.bedroomCount }} bedrooms</span><span>{{ villa.status }}</span><span>Host: {{ villa.owner?.displayName || villa.owner?.email || 'Unassigned' }}</span></div></article></div>
      </template>
      <template v-else-if="activeView === 'map'"><section class="vicinity-map-panel"><div class="dashboard-toolbar"><div><span class="eyebrow">Property locations</span><h2>Vicinity map</h2><p>Choose a property, then click the map to place its marker.</p></div><label class="vicinity-villa-select">Selected property<select :value="selectedVilla?.id || ''" @change="selectVilla(villas.find((villa) => villa.id === Number($event.target.value)))"><option value="" disabled>Select a property</option><option v-for="villa in villas" :key="villa.id" :value="villa.id">{{ villa.name }}</option></select></label></div><div class="vicinity-map" @click="placeVillaOnMap"><img v-if="publicSite.mapUrl" :src="resolveMediaUrl(publicSite.mapUrl)" alt="Bersantai vicinity map"><div v-else class="empty-state"><strong>No vicinity map uploaded</strong><span>Upload one in Configuration to place your properties on it.</span></div><span v-for="(villa, index) in villas" :key="villa.id" class="vicinity-map-marker-group" :style="{ left: `${mapPosition(villa, index).x}%`, top: `${mapPosition(villa, index).y}%` }"><button class="vicinity-map-marker" :class="{ selected: selectedVilla?.id === villa.id }" type="button" :aria-label="`Select ${villa.name}`" @click.stop="selectVilla(villa)">{{ index + 1 }}</button><span class="vicinity-map-marker-label">{{ villa.name }}</span></span></div><p class="vicinity-map-status">{{ selectedVilla ? `${selectedVilla.name} is selected. Click the map to move its marker.` : 'Select a property to place its marker.' }}</p></section></template>
      <template v-else-if="activeView === 'reservations'"><section class="reservations-panel incoming-reservations"><div class="reservation-heading"><div><span class="eyebrow">Workflow queue</span><h3>Incoming reservations</h3></div><span>{{ allReservations.length }} total</span></div><article v-for="reservation in allReservations" :key="`incoming-${reservation.id}`" class="reservation-card"><div><strong>{{ reservation.reference_number || reservation.id }}</strong><small>{{ reservation.guest_name }} · {{ reservation.check_in }}</small></div><div><strong>{{ reservation.villa_name || reservation.villa_type_name || 'Awaiting room assignment' }}</strong><small>{{ reservation.booking_status }} · {{ reservation.payment_status }}</small></div></article><p v-if="!allReservations.length" class="empty-state">No incoming reservations.</p></section>
        <div class="dashboard-toolbar"><div><h2>Reservations</h2><p>Track guest arrivals across {{ villas.length }} properties.</p></div></div><section class="reservations-panel"><div v-if="!selectedVilla" class="empty-state">Select a property from Properties to see reservations.</div><template v-else><div class="reservation-heading"><div><span class="eyebrow">Selected property</span><h3>{{ selectedVilla.name }}</h3></div><button class="text-link" type="button" @click="activeView = 'properties'">Change property ↗</button></div><div v-for="reservation in reservations" :key="reservation.id" class="reservation-card"><div class="reservation-date"><strong>{{ new Date(reservation.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</strong><small>check-in</small></div><div class="reservation-guest"><span class="guest-avatar">{{ reservation.guest_name.charAt(0) }}</span><div><strong>{{ reservation.guest_name }}</strong><small>{{ reservation.guest_email }} · {{ reservation.check_out }}</small></div></div><select :value="reservation.booking_status" aria-label="Reservation status" @change="updateStatus(reservation, $event.target.value)"><option v-for="status in ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']" :key="status" :value="status">{{ status.replace('_', ' ') }}</option></select></div><p v-if="!reservations.length" class="empty-state">No reservations for this property yet.</p></template></section>
      </template>
      <template v-else-if="activeView === 'services'"><div class="dashboard-toolbar"><div><h2>Services</h2><p>Manage the island extras guests can discover on the public site.</p></div><button class="dashboard-primary" type="button" @click="openServiceCreate">＋ Add service</button></div><div class="services-admin-layout"><section class="account-form-panel"><span class="eyebrow">{{ selectedService ? 'Edit service' : 'New service' }}</span><h3>{{ selectedService ? 'Update service' : 'Add a service' }}</h3><form class="management-form" @submit.prevent="saveService"><label>Service name<input v-model="serviceForm.title" required></label><label>URL slug<input v-model="serviceForm.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label>Description<textarea v-model="serviceForm.description" rows="4" required></textarea></label><label>Image URL<input v-model="serviceForm.imageUrl" type="url"></label><div class="form-columns"><label>Display order<input v-model="serviceForm.sortOrder" type="number" min="0"></label><label class="service-toggle">Published<input v-model="serviceForm.isActive" type="checkbox"></label></div><button class="dashboard-primary" type="submit" :disabled="serviceSaving">{{ serviceSaving ? 'Saving...' : selectedService ? 'Save changes' : 'Create service' }}</button></form></section><section class="accounts-panel services-admin-list"><div class="account-toolbar"><div><h3>Published services</h3><span>{{ services.length }} services</span></div></div><div v-if="!services.length" class="empty-state">No services yet.</div><article v-for="service in services" :key="service.id" class="service-admin-row"><div><strong>{{ service.title }}</strong><small>{{ service.description }}</small></div><span :class="{ inactive: !service.isActive }">{{ service.isActive ? 'Published' : 'Hidden' }}</span><button type="button" @click="openServiceEdit(service)">Edit</button><button type="button" @click="removeService(service)">×</button></article></section></div></template>
      <template v-else-if="activeView === 'accounts'"><div class="dashboard-toolbar"><div><h2>Accounts</h2><p>Create staff access and keep track of every Bersantai guest.</p></div></div><p v-if="accountNotice" class="account-notice" role="status">{{ accountNotice }}</p><div class="accounts-layout"><section class="account-form-panel"><span class="eyebrow">Admin tools</span><h3>{{ accountForm.role === 'host' ? 'Invite a host' : 'Create receptionist account' }}</h3><p class="account-help">{{ accountForm.role === 'host' ? `The host can manage their assigned ${propertyLabel.toLowerCase()} after joining.` : 'Give your front desk team access to assigned villa operations.' }}</p><form class="management-form" @submit.prevent="createAccount"><div class="role-switch"><button :class="{ active: accountForm.role === 'receptionist' }" type="button" @click="resetAccountForm('receptionist')">Receptionist</button><button :class="{ active: accountForm.role === 'host' }" type="button" @click="resetAccountForm('host')">Host invite</button></div><label>Full name<input v-model="accountForm.displayName" required></label><label>Email address<input v-model="accountForm.email" type="email" required></label><label>Temporary password <small>Optional. Leave blank to generate one.</small><input v-model="accountForm.password" type="password" minlength="12"></label><button class="dashboard-primary" type="submit" :disabled="accountSaving">{{ accountSaving ? 'Creating...' : accountForm.role === 'host' ? 'Send host invite' : 'Create receptionist' }}</button></form></section><section class="accounts-panel"><div class="account-toolbar"><div><h3>People</h3><span>{{ accounts.length }} accounts</span></div><select v-model="accountFilter" aria-label="Filter accounts"><option value="all">Everyone</option><option value="guest">Guests</option><option value="host">Hosts</option><option value="receptionist">Receptionists</option><option value="admin">Admins</option></select></div><p v-if="accountLoading" class="empty-state">Loading accounts...</p><div v-else class="account-list"><div v-for="account in visibleAccounts" :key="account.id" class="account-row"><span class="account-avatar">{{ account.displayName?.charAt(0).toUpperCase() || '?' }}</span><div><strong>{{ account.displayName || 'Unnamed guest' }}</strong><small>{{ account.email }}</small></div><span class="account-role">{{ account.role }}</span><span :class="`account-status ${account.accountStatus}`">{{ account.accountStatus }}</span></div><p v-if="!visibleAccounts.length" class="empty-state">No accounts in this group.</p></div></section></div></template>
      <template v-else-if="activeView === 'villa-types'"><div class="dashboard-toolbar"><div><h2>Villa Types</h2><p>Manage the bookable villa options guests can select in Airbnb mode.</p></div><button class="dashboard-primary" type="button" @click="openVillaTypeCreate">＋ Add type</button></div><div class="services-admin-layout"><section class="account-form-panel"><span class="eyebrow">{{ selectedVillaType ? 'Edit Villa Type' : 'New Villa Type' }}</span><h3>{{ selectedVillaType ? 'Update type' : 'Add a type' }}</h3><form class="management-form" @submit.prevent="saveVillaType"><label>Name<input v-model="villaTypeForm.name" required></label><label>URL slug<input v-model="villaTypeForm.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label>Description<textarea v-model="villaTypeForm.description" rows="4"></textarea></label><label>Default image URL<input v-model="villaTypeForm.defaultImageUrl" type="url"></label><div class="form-columns"><label>Nightly price<input v-model="villaTypeForm.nightlyPrice" type="number" min="0" step="0.01"></label><label>Guests<input v-model="villaTypeForm.capacity" type="number" min="1"></label><label>Bedrooms<input v-model="villaTypeForm.bedroomCount" type="number" min="0"></label></div><div class="form-columns"><label>Status<select v-model="villaTypeForm.status"><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Availability<select v-model="villaTypeForm.availabilityStatus"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select></label></div><div class="amenity-editor"><div class="amenity-heading"><span>Amenities</span><button type="button" @click="addVillaTypeAmenity">＋ Add amenity</button></div><div v-for="(_amenity, index) in villaTypeForm.amenities" :key="`type-amenity-${index}`" class="amenity-input"><input v-model="villaTypeForm.amenities[index]" placeholder="e.g. Mountain view"><button type="button" aria-label="Remove amenity" @click="removeVillaTypeAmenity(index)">×</button></div></div><div class="media-editor"><div class="amenity-heading"><span>Gallery images</span><button type="button" @click="addVillaTypeImage">＋ Add image</button></div><div v-for="(_url, index) in villaTypeForm.galleryUrls" :key="`type-image-${index}`" class="amenity-input"><input v-model="villaTypeForm.galleryUrls[index]" type="url" placeholder="https://..."><button type="button" aria-label="Remove image" @click="removeVillaTypeImage(index)">×</button></div></div><label class="service-toggle">Published<input v-model="villaTypeForm.isActive" type="checkbox"></label><button class="dashboard-primary" type="submit" :disabled="villaTypeSaving">{{ villaTypeSaving ? 'Saving...' : selectedVillaType ? 'Save changes' : 'Create type' }}</button></form></section><section class="accounts-panel services-admin-list"><div class="account-toolbar"><div><h3>Configured types</h3><span>{{ villaTypes.length }} types</span></div></div><div v-if="!villaTypes.length" class="empty-state">No villa types yet.</div><article v-for="villaType in villaTypes" :key="villaType.id" class="service-admin-row"><div><strong>{{ villaType.name }}</strong><small>{{ villaType.description || 'Bookable villa option' }} · {{ formatCurrency(villaType.nightlyPrice) }} / night · {{ villaType.capacity }} guests</small></div><span :class="{ inactive: !villaType.isActive || villaType.status !== 'active' }">{{ villaType.isActive && villaType.status === 'active' ? 'Published' : 'Hidden' }}</span><button type="button" @click="openVillaTypeEdit(villaType)">Edit</button><button type="button" @click="removeVillaType(villaType)">×</button></article></section></div></template>
      <template v-else-if="activeView === 'settings'"><div class="dashboard-toolbar"><div><h2>System configuration</h2><p>Choose the operating model and public contact details shown to guests.</p></div></div><section class="mode-panel"><span class="eyebrow">Current setup · {{ modeName }}</span><h3>How does Bersantai operate?</h3><p>Airbnb mode is designed around independent properties and hosts. Hotel mode is designed around room inventory, front-desk operations, and shared guest services.</p><div class="mode-options"><label :class="{ selected: operatingMode === 'airbnb' }"><input v-model="operatingMode" type="radio" value="airbnb"><strong>Airbnb mode</strong><small>Hosts, independent villas, flexible property operations.</small></label><label :class="{ selected: operatingMode === 'hotel' }"><input v-model="operatingMode" type="radio" value="hotel"><strong>Hotel mode</strong><small>Rooms, suites, reception workflows, and centralized operations.</small></label></div><div class="public-site-settings"><div class="editor-section-heading"><div><span class="eyebrow">Public site</span><h3>Guest-facing details</h3></div></div><div class="form-columns"><label>Location<input v-model="publicSite.location" placeholder="Kintamani, Munduk & Bedugul"></label><label>Address<input v-model="publicSite.address" placeholder="Bali, Indonesia"></label><label>Contact number<input v-model="publicSite.contactNumber" type="tel"></label><label>Contact email<input v-model="publicSite.email" type="email"></label></div><label>Short description<textarea v-model="publicSite.description" rows="3" maxlength="255"></textarea></label></div><p v-if="modeNotice" class="account-notice" role="status">{{ modeNotice }}</p><button class="dashboard-primary" type="button" :disabled="modeSaving" @click="saveMode">{{ modeSaving ? 'Saving...' : 'Save configuration' }}</button></section></template>
    </section>

    <div v-if="showEditor" class="editor-backdrop" @click.self="showEditor = false"><section class="editor-panel" aria-labelledby="editor-title"><button class="editor-close" type="button" aria-label="Close editor" @click="showEditor = false">×</button><p class="eyebrow">{{ selectedVilla ? 'Property details' : 'New listing' }}</p><h2 id="editor-title">{{ selectedVilla ? 'Update your property' : 'Add a property' }}</h2><form class="management-form" @submit.prevent="saveVilla"><label>Property name<input v-model="form.name" required></label><label>URL slug<input v-model="form.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label>Location<input v-model="form.location" required></label><label>Description<textarea v-model="form.description" rows="3"></textarea></label><label v-if="isAdmin">Owner host<select v-model="form.ownerUserId"><option :value="null">Unassigned</option><option v-for="host in hostAccounts" :key="host.id" :value="Number(host.id)">{{ host.displayName || host.email }} · {{ host.email }}</option></select></label><div class="amenity-editor"><div class="amenity-heading"><span>Amenities</span><button type="button" @click="addAmenityField">＋ Add amenity</button></div><div v-for="(_amenity, index) in form.amenities" :key="index" class="amenity-input"><input v-model="form.amenities[index]" placeholder="e.g. Breakfast included"><button type="button" aria-label="Remove amenity" @click="removeAmenityField(index)">×</button></div></div><div class="media-editor"><div class="amenity-heading"><span>Images & videos</span><button type="button" @click="addMediaField">＋ Add media</button></div><div v-for="(media, index) in form.photos" :key="index" class="media-row"><input v-model="media.url" type="url" placeholder="https://..."><select v-model="media.mediaType" aria-label="Media type"><option value="image">Image</option><option value="video">Video</option></select><label class="thumbnail-choice"><input :checked="media.isThumbnail" type="radio" name="villa-thumbnail" @change="setThumbnail(index)"> Default</label><button type="button" aria-label="Remove media" @click="removeMediaField(index)">×</button></div></div><div class="form-columns"><label>Nightly price<input v-model="form.nightlyPrice" type="number" min="0" required></label><label>Guest capacity<input v-model="form.capacity" type="number" min="1" required></label></div><div class="form-columns"><label>Bedrooms<input v-model="form.bedroomCount" type="number" min="1" required></label><label>Availability<select v-model="form.availabilityStatus"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select></label></div><button class="dashboard-primary editor-submit" type="submit" :disabled="saving">{{ saving ? 'Saving...' : selectedVilla ? 'Save changes' : 'Create property' }}</button></form></section></div>
    <div v-if="showProfile" class="editor-backdrop" @click.self="showProfile = false"><section class="editor-panel profile-modal" aria-labelledby="profile-modal-title"><button class="editor-close" type="button" aria-label="Close profile" @click="showProfile = false">×</button><p class="eyebrow">Your account</p><h2 id="profile-modal-title">Account settings</h2><form class="management-form" @submit.prevent="saveProfile"><label>Email<input :value="user?.email" type="email" disabled></label><label>Display name<input v-model="profileForm.displayName" required></label><label>Bio<textarea v-model="profileForm.bio" rows="4"></textarea></label><label>Avatar URL<input v-model="profileForm.avatarUrl" type="url"></label><button class="dashboard-primary editor-submit" type="submit">Save profile</button></form></section></div>
+  </main>
+</template>
