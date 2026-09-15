<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { villaService } from '@/services/villaService';
import { profileService } from '@/services/profileService';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const officialLogo = '/icons/bersantai-logo.png';
const villas = ref([]);
const reservations = ref([]);
const selectedVilla = ref(null);
const search = ref('');
const activeView = ref('properties');
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
const modeSaving = ref(false);
const modeNotice = ref('');
const hostAccounts = ref([]);

const defaultAmenities = ['Wi-Fi', 'Air conditioning', 'Swimming pool', 'Fresh linens'];
const blankVilla = () => ({ name: '', slug: '', location: '', description: '', nightlyPrice: 0, capacity: 2, bedroomCount: 2, status: 'active', availabilityStatus: 'available', ownerUserId: null, amenities: [...defaultAmenities], photos: [] });
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

async function loadVillas() {
  loading.value = true;
  error.value = '';
  try {
    villas.value = (await villaService.list()).villas;
    if (villas.value.length && !selectedVilla.value) await selectVilla(villas.value[0]);
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}

async function loadMode() {
  try { operatingMode.value = (await villaService.getConfig()).config.operatingMode; } catch (requestError) { error.value = requestError.message; }
}

async function selectVilla(villa) {
  selectedVilla.value = villa;
  try { reservations.value = (await villaService.reservations(villa.id)).reservations; } catch (requestError) { error.value = requestError.message; }
}

async function openCreate() {
  selectedVilla.value = null;
  if (isAdmin.value) await loadHostAccounts();
  showEditor.value = true;
}

async function openEdit(villa) {
  Object.assign(form, { ...villa, ownerUserId: villa.owner?.id || null });
  form.amenities = (villa.amenities || []).map((amenity) => amenity.name);
  form.photos = (villa.photos || []).map((photo) => ({ url: photo.url, mediaType: photo.mediaType || 'image', altText: photo.altText || '', isThumbnail: Boolean(photo.isThumbnail), sortOrder: photo.sortOrder || 0 }));
  selectedVilla.value = villa;
  if (isAdmin.value) await loadHostAccounts();
  showEditor.value = true;
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

async function updateStatus(reservation, status) {
  try { await villaService.updateReservation(selectedVilla.value.id, reservation.id, status); await selectVilla(selectedVilla.value); } catch (requestError) { error.value = requestError.message; }
}

function openProfile() {
  Object.assign(profileForm, { displayName: user.value?.displayName || '', bio: user.value?.bio || '', avatarUrl: user.value?.avatarUrl || '' });
  showProfile.value = true;
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
    operatingMode.value = (await villaService.updateConfig({ operatingMode: operatingMode.value })).config.operatingMode;
    modeNotice.value = `Saved. Bersantai is now running in ${modeName.value}.`;
  } catch (requestError) { error.value = requestError.message; } finally { modeSaving.value = false; }
}

onMounted(() => { loadVillas(); loadMode(); });
</script>

<template>
  <main class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <RouterLink class="dashboard-brand" to="/" aria-label="Back to Bersantai home"><img :src="officialLogo" alt="Bersantai Bali Private Resort"></RouterLink>
      <div class="sidebar-profile"><span class="avatar">{{ (user?.displayName || user?.email || 'B').charAt(0).toUpperCase() }}</span><div><strong>{{ user?.displayName || 'Partner' }}</strong><small>{{ user?.role }}</small></div></div>
      <nav class="dashboard-nav" aria-label="Management navigation"><button :class="{ active: activeView === 'properties' }" type="button" @click="activeView = 'properties'"><span>⌂</span> {{ propertyLabel }}</button><button :class="{ active: activeView === 'reservations' }" type="button" @click="activeView = 'reservations'"><span>▣</span> Reservations</button><button v-if="isAdmin" :class="{ active: activeView === 'accounts' }" type="button" @click="openAccounts"><span>♧</span> Accounts</button><button v-if="isAdmin" :class="{ active: activeView === 'settings' }" type="button" @click="activeView = 'settings'"><span>⚙</span> Configuration</button></nav>
      <div class="sidebar-bottom"><button type="button" @click="openProfile">Account settings</button><RouterLink to="/">View public site</RouterLink></div>
    </aside>

    <section class="dashboard-main">
      <header class="dashboard-topbar"><div><p class="eyebrow">{{ user?.role }} workspace</p><h1>{{ activeView === 'properties' ? 'Good morning, ' : '' }}{{ user?.displayName || 'Partner' }}</h1></div><div class="topbar-actions"><button class="notification-button" type="button" aria-label="Notifications">♧<i></i></button><button class="topbar-avatar" type="button" aria-label="Open profile" @click="openProfile">{{ (user?.displayName || 'B').charAt(0).toUpperCase() }}</button></div></header>
      <p v-if="error" class="management-error" role="alert">{{ error }}</p>
      <template v-if="activeView === 'properties'">
        <div class="metric-grid"><article v-for="metric in metrics" :key="metric.label" class="metric-card"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small></article></div>
        <div class="dashboard-toolbar"><div><h2>Your {{ propertyLabel.toLowerCase() }}</h2><p>{{ isHotelMode ? 'Manage room inventory, housekeeping status, and guest stays.' : 'Keep your stays looking their best.' }}</p></div><div class="toolbar-actions"><label class="search-field"><span aria-hidden="true">⌕</span><input v-model="search" type="search" :placeholder="`Search ${propertyLabel.toLowerCase()}`"></label><button v-if="isAdmin" class="dashboard-primary" type="button" @click="openCreate">＋ Add {{ propertySingular }}</button></div></div>
        <div v-if="loading" class="empty-state">Loading your properties...</div><div v-else-if="!filteredVillas.length" class="empty-state"><strong>No properties found</strong><span>{{ search ? 'Try a different search.' : 'Your assigned properties will appear here.' }}</span></div><div v-else class="property-grid"><article v-for="villa in filteredVillas" :key="villa.id" class="property-card" :class="{ selected: selectedVilla?.id === villa.id }" @click="selectVilla(villa)"><div class="property-photo"><video v-if="villa.photos?.[0]?.mediaType === 'video'" :src="villa.photos[0].url" muted preload="metadata" :aria-label="`${villa.name} video`"></video><img v-else :src="villa.photos?.[0]?.url || '/icons/Background.jpg'" :alt="villa.name" loading="lazy"><span :class="`availability-pill ${villa.availabilityStatus}`">{{ villa.availabilityStatus }}</span><button v-if="canEdit" class="card-edit" type="button" aria-label="Edit property" @click.stop="openEdit(villa)">⋯</button></div><div class="property-info"><div><h3>{{ villa.name }}</h3><p>{{ villa.location }}</p></div><strong>${{ villa.nightlyPrice }}<small> / night</small></strong></div><div class="property-meta"><span>{{ villa.capacity }} guests</span><span>{{ villa.bedroomCount }} bedrooms</span><span>{{ villa.status }}</span></div></article></div>
      </template>
      <template v-else-if="activeView === 'reservations'">
        <div class="dashboard-toolbar"><div><h2>Reservations</h2><p>Track guest arrivals across {{ villas.length }} properties.</p></div></div><section class="reservations-panel"><div v-if="!selectedVilla" class="empty-state">Select a property from Properties to see reservations.</div><template v-else><div class="reservation-heading"><div><span class="eyebrow">Selected property</span><h3>{{ selectedVilla.name }}</h3></div><button class="text-link" type="button" @click="activeView = 'properties'">Change property ↗</button></div><div v-for="reservation in reservations" :key="reservation.id" class="reservation-card"><div class="reservation-date"><strong>{{ new Date(reservation.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</strong><small>check-in</small></div><div class="reservation-guest"><span class="guest-avatar">{{ reservation.guest_name.charAt(0) }}</span><div><strong>{{ reservation.guest_name }}</strong><small>{{ reservation.guest_email }} · {{ reservation.check_out }}</small></div></div><select :value="reservation.booking_status" aria-label="Reservation status" @change="updateStatus(reservation, $event.target.value)"><option v-for="status in ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']" :key="status" :value="status">{{ status.replace('_', ' ') }}</option></select></div><p v-if="!reservations.length" class="empty-state">No reservations for this property yet.</p></template></section>
      </template>
      <template v-else-if="activeView === 'accounts'"><div class="dashboard-toolbar"><div><h2>Accounts</h2><p>Create staff access and keep track of every Bersantai guest.</p></div></div><p v-if="accountNotice" class="account-notice" role="status">{{ accountNotice }}</p><div class="accounts-layout"><section class="account-form-panel"><span class="eyebrow">Admin tools</span><h3>{{ accountForm.role === 'host' ? 'Invite a host' : 'Create receptionist account' }}</h3><p class="account-help">{{ accountForm.role === 'host' ? `The host can manage their assigned ${propertyLabel.toLowerCase()} after joining.` : 'Give your front desk team access to assigned villa operations.' }}</p><form class="management-form" @submit.prevent="createAccount"><div class="role-switch"><button :class="{ active: accountForm.role === 'receptionist' }" type="button" @click="resetAccountForm('receptionist')">Receptionist</button><button :class="{ active: accountForm.role === 'host' }" type="button" @click="resetAccountForm('host')">Host invite</button></div><label>Full name<input v-model="accountForm.displayName" required></label><label>Email address<input v-model="accountForm.email" type="email" required></label><label>Temporary password <small>Optional. Leave blank to generate one.</small><input v-model="accountForm.password" type="password" minlength="12"></label><button class="dashboard-primary" type="submit" :disabled="accountSaving">{{ accountSaving ? 'Creating...' : accountForm.role === 'host' ? 'Send host invite' : 'Create receptionist' }}</button></form></section><section class="accounts-panel"><div class="account-toolbar"><div><h3>People</h3><span>{{ accounts.length }} accounts</span></div><select v-model="accountFilter" aria-label="Filter accounts"><option value="all">Everyone</option><option value="guest">Guests</option><option value="host">Hosts</option><option value="receptionist">Receptionists</option><option value="admin">Admins</option></select></div><p v-if="accountLoading" class="empty-state">Loading accounts...</p><div v-else class="account-list"><div v-for="account in visibleAccounts" :key="account.id" class="account-row"><span class="account-avatar">{{ account.displayName?.charAt(0).toUpperCase() || '?' }}</span><div><strong>{{ account.displayName || 'Unnamed guest' }}</strong><small>{{ account.email }}</small></div><span class="account-role">{{ account.role }}</span><span :class="`account-status ${account.accountStatus}`">{{ account.accountStatus }}</span></div><p v-if="!visibleAccounts.length" class="empty-state">No accounts in this group.</p></div></section></div></template>
      <template v-else><div class="dashboard-toolbar"><div><h2>System configuration</h2><p>Choose the operating model that shapes your daily workflow.</p></div></div><section class="mode-panel"><span class="eyebrow">Current setup · {{ modeName }}</span><h3>How does Bersantai operate?</h3><p>Airbnb mode is designed around independent properties and hosts. Hotel mode is designed around room inventory, front-desk operations, and shared guest services.</p><div class="mode-options"><label :class="{ selected: operatingMode === 'airbnb' }"><input v-model="operatingMode" type="radio" value="airbnb"><strong>Airbnb mode</strong><small>Hosts, independent villas, flexible property operations.</small></label><label :class="{ selected: operatingMode === 'hotel' }"><input v-model="operatingMode" type="radio" value="hotel"><strong>Hotel mode</strong><small>Rooms, suites, reception workflows, and centralized operations.</small></label></div><p v-if="modeNotice" class="account-notice" role="status">{{ modeNotice }}</p><button class="dashboard-primary" type="button" :disabled="modeSaving" @click="saveMode">{{ modeSaving ? 'Saving...' : 'Save operating mode' }}</button></section></template>
    </section>

    <div v-if="showEditor" class="editor-backdrop" @click.self="showEditor = false"><section class="editor-panel" aria-labelledby="editor-title"><button class="editor-close" type="button" aria-label="Close editor" @click="showEditor = false">×</button><p class="eyebrow">{{ selectedVilla ? 'Property details' : 'New listing' }}</p><h2 id="editor-title">{{ selectedVilla ? 'Update your property' : 'Add a property' }}</h2><form class="management-form" @submit.prevent="saveVilla"><label>Property name<input v-model="form.name" required></label><label>URL slug<input v-model="form.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label>Location<input v-model="form.location" required></label><label>Description<textarea v-model="form.description" rows="3"></textarea></label><label v-if="isAdmin">Owner host<select v-model="form.ownerUserId"><option :value="null">Unassigned</option><option v-for="host in hostAccounts" :key="host.id" :value="Number(host.id)">{{ host.displayName || host.email }} · {{ host.email }}</option></select></label><div class="amenity-editor"><div class="amenity-heading"><span>Amenities</span><button type="button" @click="addAmenityField">＋ Add amenity</button></div><div v-for="(_amenity, index) in form.amenities" :key="index" class="amenity-input"><input v-model="form.amenities[index]" placeholder="e.g. Breakfast included"><button type="button" aria-label="Remove amenity" @click="removeAmenityField(index)">×</button></div></div><div class="media-editor"><div class="amenity-heading"><span>Images & videos</span><button type="button" @click="addMediaField">＋ Add media</button></div><div v-for="(media, index) in form.photos" :key="index" class="media-row"><input v-model="media.url" type="url" placeholder="https://..."><select v-model="media.mediaType" aria-label="Media type"><option value="image">Image</option><option value="video">Video</option></select><label class="thumbnail-choice"><input :checked="media.isThumbnail" type="radio" name="villa-thumbnail" @change="setThumbnail(index)"> Default</label><button type="button" aria-label="Remove media" @click="removeMediaField(index)">×</button></div></div><div class="form-columns"><label>Nightly price<input v-model="form.nightlyPrice" type="number" min="0" required></label><label>Guest capacity<input v-model="form.capacity" type="number" min="1" required></label></div><div class="form-columns"><label>Bedrooms<input v-model="form.bedroomCount" type="number" min="1" required></label><label>Availability<select v-model="form.availabilityStatus"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select></label></div><button class="dashboard-primary editor-submit" type="submit" :disabled="saving">{{ saving ? 'Saving...' : selectedVilla ? 'Save changes' : 'Create property' }}</button></form></section></div>
    <div v-if="showProfile" class="editor-backdrop" @click.self="showProfile = false"><section class="editor-panel profile-modal" aria-labelledby="profile-modal-title"><button class="editor-close" type="button" aria-label="Close profile" @click="showProfile = false">×</button><p class="eyebrow">Your account</p><h2 id="profile-modal-title">Account settings</h2><form class="management-form" @submit.prevent="saveProfile"><label>Email<input :value="user?.email" type="email" disabled></label><label>Display name<input v-model="profileForm.displayName" required></label><label>Bio<textarea v-model="profileForm.bio" rows="4"></textarea></label><label>Avatar URL<input v-model="profileForm.avatarUrl" type="url"></label><button class="dashboard-primary editor-submit" type="submit">Save profile</button></form></section></div>
+  </main>
+</template>
