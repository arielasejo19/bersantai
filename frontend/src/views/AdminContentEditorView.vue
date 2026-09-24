<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatCurrency } from '@/services/currency';
import { villaService } from '@/services/villaService';
import { serviceService } from '@/services/serviceService';
import { menuService } from '@/services/menuService';
import { packageService } from '@/services/packageService';
import MediaUploadField from '@/components/MediaUploadField.vue';

const route = useRoute();
const router = useRouter();
const resource = computed(() => String(route.meta.resource));
const isEditing = computed(() => Boolean(route.params.resourceId));
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const mediaFile = ref(null);
const categories = ref([]);
const villas = ref([]);
const menuItems = ref([]);
const form = reactive({
  name: '', title: '', slug: '', description: '', imageUrl: '', mediaType: 'image',
  categoryId: '', category: 'service', mealOfDay: '', price: 0, isAvailable: true,
  isActive: true, dayTourOnly: false, sortOrder: 0, defaultImageUrl: '',
  defaultMediaType: 'image', galleryUrls: [], nightlyPrice: 0, capacity: 2,
  bedroomCount: 1, status: 'active', availabilityStatus: 'available',
  standardCheckIn: '15:00', standardCheckOut: '11:00', amenities: [],
  villaIds: [], menuItems: []
});

const labels = {
  'villa-type': { singular: 'villa type', plural: 'Villa Types', backSection: 'villa-types' },
  service: { singular: 'service', plural: 'Services', backSection: 'services' },
  menu: { singular: 'food item', plural: 'Menus / Foods', backSection: 'menus' },
  package: { singular: 'package', plural: 'Packages / Bundles', backSection: 'packages' }
};
const editorLabel = computed(() => labels[resource.value] || labels.service);
const contentName = computed({ get: () => resource.value === 'service' ? form.title : form.name, set: (value) => { if (resource.value === 'service') form.title = value; else form.name = value; } });

function resetForm() {
  Object.assign(form, { name: '', title: '', slug: '', description: '', imageUrl: '', mediaType: 'image', categoryId: '', category: 'service', mealOfDay: '', price: 0, isAvailable: true, isActive: true, dayTourOnly: false, sortOrder: 0, defaultImageUrl: '', defaultMediaType: 'image', galleryUrls: [], nightlyPrice: 0, capacity: 2, bedroomCount: 1, status: 'active', availabilityStatus: 'available', standardCheckIn: '15:00', standardCheckOut: '11:00', amenities: [], villaIds: [], menuItems: [] });
}
function selectedFood(id) { return form.menuItems.find((item) => String(item.menuItemId) === String(id)); }
function toggleFood(id) { const selected = selectedFood(id); if (selected) form.menuItems = form.menuItems.filter((item) => String(item.menuItemId) !== String(id)); else form.menuItems.push({ menuItemId: id, quantity: 1 }); }
function applyRecord(record) {
  if (resource.value === 'villa-type') Object.assign(form, { ...record, defaultImageUrl: record.defaultImageUrl || '', defaultMediaType: record.defaultMediaType || 'image', standardCheckIn: record.standardCheckIn || '15:00', standardCheckOut: record.standardCheckOut || '11:00' });
  if (resource.value === 'service') Object.assign(form, { ...record, title: record.title || '', imageUrl: record.imageUrl || '', mediaType: record.mediaType || 'image' });
  if (resource.value === 'menu') Object.assign(form, { ...record, imageUrl: record.imageUrl || '', mediaType: record.mediaType || 'image', categoryId: record.categoryId || '', mealOfDay: record.mealOfDay || '' });
  if (resource.value === 'package') Object.assign(form, { ...record, imageUrl: record.imageUrl || '', mediaType: record.mediaType || 'image', villaIds: record.villas.map((villa) => villa.id), menuItems: record.menuItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })) });
}
async function load() {
  try {
    if (resource.value === 'villa-type') {
      const result = await villaService.listTypes();
      if (isEditing.value) applyRecord(result.villaTypes.find((item) => String(item.id) === String(route.params.resourceId)) || (() => { throw new Error('Villa type not found'); })());
    }
    if (resource.value === 'service') {
      const result = await serviceService.list();
      if (isEditing.value) applyRecord(result.services.find((item) => String(item.id) === String(route.params.resourceId)) || (() => { throw new Error('Service not found'); })());
    }
    if (resource.value === 'menu') {
      const [items, categoryResult] = await Promise.all([menuService.list(), menuService.categories()]);
      categories.value = categoryResult.categories;
      if (isEditing.value) applyRecord(items.menuItems.find((item) => String(item.id) === String(route.params.resourceId)) || (() => { throw new Error('Food item not found'); })());
    }
    if (resource.value === 'package') {
      const [packageResult, villaResult, menuResult] = await Promise.all([packageService.list(), villaService.list(), menuService.list()]);
      villas.value = villaResult.villas;
      menuItems.value = menuResult.menuItems;
      if (isEditing.value) applyRecord(packageResult.packages.find((item) => String(item.id) === String(route.params.resourceId)) || (() => { throw new Error('Package not found'); })());
    }
  } catch (requestError) { error.value = requestError.message; } finally { loading.value = false; }
}
async function upload(resourceId, result) {
  if (!mediaFile.value) return result;
  const data = new FormData();
  data.append('media', mediaFile.value);
  if (resource.value === 'villa-type') return (await villaService.uploadTypeMedia(resourceId, data)).villaType;
  if (resource.value === 'service') return (await serviceService.uploadMedia(resourceId, data)).service;
  if (resource.value === 'menu') return (await menuService.uploadMedia(resourceId, data)).menuItem;
  return (await packageService.uploadMedia(resourceId, data)).package;
}
async function save() {
  saving.value = true; error.value = '';
  try {
    let result;
    if (resource.value === 'villa-type') { const payload = { ...form, defaultImageUrl: form.defaultImageUrl || null }; result = isEditing.value ? await villaService.updateType(route.params.resourceId, payload) : await villaService.createType(payload); }
    if (resource.value === 'service') { const payload = { ...form, imageUrl: form.imageUrl || null, price: Number(form.price), sortOrder: Number(form.sortOrder) }; result = isEditing.value ? await serviceService.update(route.params.resourceId, payload) : await serviceService.create(payload); }
    if (resource.value === 'menu') result = isEditing.value ? await menuService.update(route.params.resourceId, { ...form, categoryId: form.categoryId || null, mealOfDay: form.mealOfDay || null, price: Number(form.price), imageUrl: form.imageUrl || null }) : await menuService.create({ ...form, categoryId: form.categoryId || null, mealOfDay: form.mealOfDay || null, price: Number(form.price), imageUrl: form.imageUrl || null });
    if (resource.value === 'package') { const payload = { ...form, price: Number(form.price), villaIds: form.villaIds.map(Number), menuItems: form.menuItems.map((item) => ({ menuItemId: Number(item.menuItemId), quantity: Number(item.quantity) })), imageUrl: form.imageUrl || null }; result = isEditing.value ? await packageService.update(route.params.resourceId, payload) : await packageService.create(payload); }
    const recordKey = resource.value === 'villa-type' ? 'villaType' : resource.value === 'service' ? 'service' : resource.value === 'menu' ? 'menuItem' : 'package';
    const record = await upload(result[recordKey].id, result[recordKey]);
    await router.push({ name: 'management', query: { section: editorLabel.value.backSection } });
    return record;
  } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; }
}
function cancel() { router.push({ name: 'management', query: { section: editorLabel.value.backSection } }); }
onMounted(load);
</script>

<template>
  <main class="editor-page">
    <header class="editor-page-header"><button class="editor-back-button" type="button" @click="cancel"><span aria-hidden="true">←</span><span>Back to {{ editorLabel.plural }}</span></button><img src="/icons/bersantai-logo.png" alt="Bersantai" class="editor-page-logo"></header>
    <section v-if="loading" class="editor-page-loading">Loading {{ editorLabel.singular }}...</section>
    <form v-else class="catalog-editor-layout" @submit.prevent="save">
      <div class="catalog-editor-main"><p class="eyebrow">{{ isEditing ? `Edit ${editorLabel.singular}` : `New ${editorLabel.singular}` }}</p><h1>{{ isEditing ? 'Refine the details.' : 'Create something considered.' }}</h1><p class="editor-lede">Keep this content polished, available, and ready for guests to discover.</p>
        <p v-if="error" class="management-error" role="alert">{{ error }}</p>
        <section class="editor-card"><div class="editor-section-heading"><h2>Content & media</h2></div><div class="editor-form-grid"><label>{{ resource === 'service' ? 'Service name' : resource === 'villa-type' ? 'Villa type name' : resource === 'menu' ? 'Food name' : 'Package name' }}<input v-model="contentName" required></label><label>URL slug<input v-model="form.slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label></div><label>Description<textarea v-model="form.description" rows="5" :required="resource === 'service'"></textarea></label><MediaUploadField :url="resource === 'villa-type' ? form.defaultImageUrl : form.imageUrl" :media-type="resource === 'villa-type' ? form.defaultMediaType : form.mediaType" :label="`${editorLabel.singular} photo or video`" @select="mediaFile = $event"></MediaUploadField></section>
        <section v-if="resource === 'villa-type'" class="editor-card"><div class="editor-section-heading"><h2>Pricing, capacity & stay times</h2></div><div class="editor-form-grid"><label>Nightly price<input v-model="form.nightlyPrice" type="number" min="0" step="0.01"></label><label>Guest capacity<input v-model="form.capacity" type="number" min="1"></label><label>Bedrooms<input v-model="form.bedroomCount" type="number" min="0"></label><label>Status<select v-model="form.status"><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Availability<select v-model="form.availabilityStatus"><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="maintenance">Maintenance</option></select></label><label>Standard check-in<input v-model="form.standardCheckIn" type="time" required></label><label>Standard check-out<input v-model="form.standardCheckOut" type="time" required></label></div></section>
        <section v-else-if="resource === 'service'" class="editor-card"><div class="editor-section-heading"><h2>Service details</h2></div><div class="editor-form-grid"><label>Price<input v-model="form.price" type="number" min="0" step="0.01"></label><label>Category<input v-model="form.category"></label><label>Display order<input v-model="form.sortOrder" type="number" min="0"></label></div><label class="service-toggle">Published<input v-model="form.isActive" type="checkbox"></label></section>
        <section v-else-if="resource === 'menu'" class="editor-card"><div class="editor-section-heading"><h2>Food details</h2></div><div class="editor-form-grid"><label>Food category<select v-model="form.categoryId"><option value="">Choose a category</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label><label>Meal of the day<select v-model="form.mealOfDay"><option value="">Any time</option><option value="breakfast">Breakfast</option><option value="brunch">Brunch</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="late-night">Late night</option></select></label><label>Price<input v-model="form.price" type="number" min="0" step="0.01"></label></div><div class="editor-form-grid"><label class="service-toggle">Available<input v-model="form.isAvailable" type="checkbox"></label><label class="service-toggle">Active<input v-model="form.isActive" type="checkbox"></label></div></section>
        <section v-else class="editor-card"><div class="editor-section-heading"><h2>Package details</h2></div><label>Package price<input v-model="form.price" type="number" min="0" step="0.01"></label><fieldset class="package-picker"><legend>Villas included</legend><label v-for="villa in villas" :key="villa.id"><input v-model="form.villaIds" type="checkbox" :value="villa.id"> {{ villa.name }} · {{ formatCurrency(villa.nightlyPrice) }}</label></fieldset><fieldset class="package-picker"><legend>Food included</legend><label v-for="item in menuItems" :key="item.id"><input type="checkbox" :checked="Boolean(selectedFood(item.id))" @change="toggleFood(item.id)"> {{ item.name }} · {{ formatCurrency(item.price) }}<input v-if="selectedFood(item.id)" v-model="selectedFood(item.id).quantity" class="quantity-input" type="number" min="1" aria-label="Quantity"></label></fieldset><div class="editor-form-grid"><label class="service-toggle">Available<input v-model="form.isAvailable" type="checkbox"></label><label class="service-toggle">Active<input v-model="form.isActive" type="checkbox"></label></div></section>
        <div class="editor-actions"><button class="secondary-button" type="button" @click="cancel">Cancel</button><button class="dashboard-primary" type="submit" :disabled="saving">{{ saving ? 'Saving...' : isEditing ? 'Save changes' : `Create ${editorLabel.singular}` }}</button></div>
      </div>
    </form>
  </main>
</template>
