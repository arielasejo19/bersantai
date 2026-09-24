<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { villaService } from '@/services/villaService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const saving = ref(false);
const uploading = ref(false);
const loading = ref(Boolean(route.params.villaId));
const error = ref('');
const villas = ref([]);
const villaTypes = ref([]);
const hostAccounts = ref([]);
const media = ref([]);
const fileInput = ref(null);
const isEditing = computed(() => Boolean(route.params.villaId));
const isAdmin = computed(() => user.value?.role === 'admin');
const defaultAmenities = ['Wi-Fi', 'Air conditioning', 'Swimming pool', 'Fresh linens'];
const form = reactive({ name: '', slug: '', location: '', villaTypeId: null, description: '', nightlyPrice: 0, capacity: 2, bedroomCount: 2, status: 'active', availabilityStatus: 'available', stayType: 'both', standardCheckIn: '15:00', standardCheckOut: '11:00', ownerUserId: null, amenities: [...defaultAmenities] });

function addAmenity() { form.amenities.push(''); }
function removeAmenity(index) { form.amenities.splice(index, 1); }
function moveMedia(index, direction) { const next = index + direction; if (next < 0 || next >= media.value.length) return; [media.value[index], media.value[next]] = [media.value[next], media.value[index]]; }
function setPrimary(index) { media.value.forEach((item, itemIndex) => { item.isThumbnail = itemIndex === index; }); }
function removeMedia(index) { media.value.splice(index, 1); if (media.value.length && !media.value.some((item) => item.isThumbnail)) media.value[0].isThumbnail = true; }
function selectFiles(event) { addFiles(event.target.files); event.target.value = ''; }
function onDrop(event) { addFiles(event.dataTransfer.files); }
function addFiles(files) {
  const accepted = [...files].filter((file) => file.type.startsWith('image/') || ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type));
  media.value.push(...accepted.map((file) => ({ file, url: URL.createObjectURL(file), mediaType: file.type.startsWith('video/') ? 'video' : 'image', isThumbnail: media.value.length === 0, isNew: true })));
}
function normalizeTime(value, fallback) { return String(value || fallback).slice(0, 5); }
async function uploadNewMedia(villaId) {
  const files = media.value.filter((item) => item.file);
  if (!files.length) return;
  const previewUrls = files.map((item) => item.url);
  uploading.value = true;
  try {
    const data = new FormData();
    files.forEach((item) => data.append('media', item.file));
    const result = await villaService.uploadMedia(villaId, data);
    media.value = result.villa.photos.map((item) => ({ ...item, isNew: false }));
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
  } finally {
    uploading.value = false;
  }
}
async function load() {
  try {
    const typeRequest = user.value?.role === 'admin' ? villaService.listTypes() : villaService.listPublicTypes();
    const [typeResult, villaResult, accountResult] = await Promise.all([typeRequest, villaService.list(), isAdmin.value ? villaService.listAccounts() : Promise.resolve({ accounts: [] })]);
    villaTypes.value = typeResult.villaTypes;
    villas.value = villaResult.villas;
    hostAccounts.value = accountResult.accounts.filter((account) => account.role === 'host' && account.accountStatus === 'active');
    if (isEditing.value) {
      const villa = villas.value.find((item) => String(item.id) === String(route.params.villaId));
      if (!villa) throw new Error('Villa not found');
      Object.assign(form, { ...villa, villaTypeId: villa.villaType?.id || null, ownerUserId: villa.owner?.id || null, standardCheckIn: normalizeTime(villa.standardCheckIn, '15:00'), standardCheckOut: normalizeTime(villa.standardCheckOut, '11:00'), amenities: (villa.amenities || []).map((item) => item.name || item) });
      media.value = (villa.photos || []).map((item) => ({ ...item, isNew: false }));
    }
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}
async function save() {
  saving.value = true; error.value = '';
  try {
    const payload = { name: form.name.trim(), slug: form.slug.trim(), location: form.location.trim(), villaTypeId: form.villaTypeId ? Number(form.villaTypeId) : null, description: form.description || '', nightlyPrice: Number(form.nightlyPrice), capacity: Number(form.capacity), bedroomCount: Number(form.bedroomCount), status: form.status, availabilityStatus: form.availabilityStatus, stayType: form.stayType, standardCheckIn: normalizeTime(form.standardCheckIn, '15:00'), standardCheckOut: normalizeTime(form.standardCheckOut, '11:00'), ownerUserId: form.ownerUserId ? Number(form.ownerUserId) : null, amenities: form.amenities.filter(Boolean), photos: media.value.filter((item) => !item.file).map((item, index) => ({ url: item.url, mediaType: item.mediaType, altText: item.altText || '', isThumbnail: Boolean(item.isThumbnail), sortOrder: index })) };
    const result = isEditing.value ? null : await villaService.create(payload);
    const villaId = route.params.villaId || result.villa.id;
    await uploadNewMedia(villaId);
    const finalPhotos = media.value.filter((item) => !item.file).map((item, index) => ({ url: item.url, mediaType: item.mediaType, altText: item.altText || '', isThumbnail: Boolean(item.isThumbnail), sortOrder: index }));
    await villaService.update(villaId, { ...payload, photos: finalPhotos });
    await router.push('/management');
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; uploading.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="editor-page">
    <header class="editor-page-header"><button class="editor-back-button" type="button" @click="router.push('/management')"><span aria-hidden="true">←</span><span>Back to management</span></button><img :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai" class="editor-page-logo"></header>
    <section v-if="loading" class="editor-page-loading">Loading villa details...</section>
    <form v-else class="villa-editor-layout" @submit.prevent="save">
      <section class="editor-card stay-times-card"><div class="editor-section-heading"><div><h2>Standard stay times</h2><p>Set the default arrival and departure times shown to guests.</p></div></div><div class="editor-form-grid"><label>Standard check-in<input v-model="form.standardCheckIn" type="time" required></label><label>Standard check-out<input v-model="form.standardCheckOut" type="time" required></label></div></section>
      <div class="villa-editor-main"><p class="eyebrow">{{ isEditing ? 'Edit room / villa' : 'New room / villa' }}</p><h1>{{ isEditing ? 'Refine your stay.' : 'Create a stay.' }}</h1><p class="editor-lede">Build a complete guest-ready listing with thoughtful details, media, and booking rules.</p>
        <section class="editor-card media-uploader-section"><div class="editor-section-heading"><div><h2>Photos & video</h2><p>Show guests the feeling of the stay. Your first image becomes the cover.</p></div><span>{{ media.length }} media</span></div><div class="dropzone" @dragover.prevent @drop.prevent="onDrop" @click="fileInput?.click()"><input ref="fileInput" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple hidden @change="selectFiles"><strong>Drop photos and video here</strong><span>or select files from your device</span><small>JPG, PNG, WEBP, MP4, WEBM up to 50MB each</small></div><div v-if="media.length" class="media-preview-grid"><article v-for="(item, index) in media" :key="item.id || item.url" class="media-preview"><video v-if="item.mediaType === 'video'" :src="resolveMediaUrl(item.url)" muted controls></video><img v-else :src="resolveMediaUrl(item.url)" alt="Villa media preview"><span v-if="item.isThumbnail" class="primary-media-label">Cover image</span><div class="media-actions"><button type="button" :disabled="index === 0" aria-label="Move media left" @click="moveMedia(index, -1)">←</button><button type="button" :disabled="index === media.length - 1" aria-label="Move media right" @click="moveMedia(index, 1)">→</button><button type="button" @click="setPrimary(index)">{{ item.isThumbnail ? 'Cover' : 'Make cover' }}</button><button type="button" aria-label="Remove media" @click="removeMedia(index)">×</button></div></article></div><div v-else class="media-empty">No media uploaded yet. Your listing will display a clean empty state until you add photos or video.</div></section>
        <section class="editor-card"><div class="editor-section-heading"><h2>Basic information</h2></div><div class="editor-form-grid"><label>Name<input v-model="form.name" required></label><label>URL slug<input v-model="form.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label>Location<input v-model="form.location" required></label><label>Villa type<select v-model="form.villaTypeId"><option :value="null">Unassigned</option><option v-for="type in villaTypes" :key="type.id" :value="type.id">{{ type.name }}</option></select></label><label v-if="isAdmin">Owner host<select v-model="form.ownerUserId"><option :value="null">Unassigned</option><option v-for="host in hostAccounts" :key="host.id" :value="host.id">{{ host.displayName }} · {{ host.email }}</option></select></label></div><label>Description<textarea v-model="form.description" rows="5"></textarea></label></section>
        <section class="editor-card"><div class="editor-section-heading"><h2>Pricing & capacity</h2></div><div class="editor-form-grid"><label>Nightly price (₱)<input v-model="form.nightlyPrice" type="number" min="0" step="0.01" required></label><label>Guest capacity<input v-model="form.capacity" type="number" min="1" required></label><label>Bedrooms<input v-model="form.bedroomCount" type="number" min="1" required></label></div><p class="price-preview">Preview: {{ formatCurrency(form.nightlyPrice) }} / night</p></section>
        <section class="editor-card"><div class="editor-section-heading"><h2>Amenities & booking</h2></div><div class="amenity-editor"><div class="amenity-heading"><span>Amenities</span><button type="button" @click="addAmenity">＋ Add amenity</button></div><div v-for="(_amenity, index) in form.amenities" :key="index" class="amenity-input"><input v-model="form.amenities[index]" placeholder="e.g. Breakfast included"><button type="button" aria-label="Remove amenity" @click="removeAmenity(index)">×</button></div></div><div class="editor-form-grid"><label>Stay type<select v-model="form.stayType"><option value="both">Day Tour & Overnight</option><option value="day_tour">Day Tour only</option><option value="overnight">Overnight only</option></select></label><label>Status<select v-model="form.status"><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Availability<select v-model="form.availabilityStatus"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select></label></div></section>
        <p v-if="error" class="management-error" role="alert">{{ error }}</p><div class="editor-actions"><button class="secondary-button" type="button" @click="router.push('/management')">Cancel</button><button class="dashboard-primary" type="submit" :disabled="saving || uploading">{{ uploading ? 'Uploading media...' : saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create room / villa' }}</button></div>
      </div>
    </form>
  </main>
</template>
