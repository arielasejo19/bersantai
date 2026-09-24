<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { menuService } from '@/services/menuService';
import { packageService } from '@/services/packageService';
import { villaService } from '@/services/villaService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';
import MediaUploadField from '@/components/MediaUploadField.vue';

const packages = ref([]); const villas = ref([]); const menuItems = ref([]); const selected = ref(null); const saving = ref(false); const error = ref(''); const mediaFile = ref(null);
const router = useRouter();
const form = reactive({ name: '', slug: '', description: '', imageUrl: '', mediaType: 'image', price: 0, isAvailable: true, isActive: true, villaIds: [], menuItems: [] });
function reset() { selected.value = null; mediaFile.value = null; Object.assign(form, { name: '', slug: '', description: '', imageUrl: '', mediaType: 'image', price: 0, isAvailable: true, isActive: true, villaIds: [], menuItems: [] }); }
function edit(item) { selected.value = item; Object.assign(form, { ...item, villaIds: item.villas.map((villa) => villa.id), menuItems: item.menuItems.map((food) => ({ menuItemId: food.id, quantity: food.quantity })) }); }
function selectedFood(id) { return form.menuItems.find((item) => String(item.menuItemId) === String(id)); }
function toggleFood(id) { const existing = selectedFood(id); if (existing) form.menuItems = form.menuItems.filter((item) => String(item.menuItemId) !== String(id)); else form.menuItems.push({ menuItemId: id, quantity: 1 }); }
async function load() { const [packageResult, villaResult, menuResult] = await Promise.all([packageService.list(), villaService.list(), menuService.list()]); packages.value = packageResult.packages; villas.value = villaResult.villas; menuItems.value = menuResult.menuItems; }
async function save() { saving.value = true; error.value = ''; try { const payload = { ...form, price: Number(form.price), villaIds: form.villaIds.map(Number), menuItems: form.menuItems.map((item) => ({ menuItemId: Number(item.menuItemId), quantity: Number(item.quantity) })), imageUrl: form.imageUrl || null }; const result = selected.value ? await packageService.update(selected.value.id, payload) : await packageService.create(payload); if (mediaFile.value) { const data = new FormData(); data.append('media', mediaFile.value); await packageService.uploadMedia(result.package.id, data); } reset(); await load(); } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; } }
async function remove(item) { if (!window.confirm(`Remove ${item.name}?`)) return; try { await packageService.remove(item.id); await load(); } catch (requestError) { error.value = requestError.message; } }
onMounted(async () => { try { await load(); } catch (requestError) { error.value = requestError.message; } });
</script>

<template>
  <div class="dashboard-toolbar"><div><h2>Packages / Bundles</h2><p>Combine villas and food into offers guests can book or inquire about.</p></div><button class="dashboard-primary" type="button" @click="router.push({ name: 'package-create' })">＋ Add package</button></div>
  <p v-if="error" class="management-error" role="alert">{{ error }}</p>
  <div class="services-admin-layout">
    <section class="account-form-panel"><span class="eyebrow">Package workspace</span><h3>Manage your offers</h3><p class="account-help">Create and edit bundled villa and food offers on their dedicated editor page.</p><button class="dashboard-primary" type="button" @click="router.push({ name: 'package-create' })">＋ Create package</button></section>
    <section class="accounts-panel"><div class="account-toolbar"><div><h3>Offers</h3><span>{{ packages.length }} packages</span></div></div><p v-if="!packages.length" class="empty-state">No packages yet.</p><article v-for="item in packages" :key="item.id" class="service-admin-row"><img v-if="item.imageUrl" class="admin-list-thumb" :src="resolveMediaUrl(item.imageUrl)" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.villas.length }} villa(s) · {{ item.menuItems.length }} food item(s) · {{ formatCurrency(item.price) }}</small></div><span :class="{ inactive: !item.isActive || !item.isAvailable }">{{ item.isActive && item.isAvailable ? 'Published' : 'Hidden' }}</span><button type="button" @click="router.push({ name: 'package-edit', params: { resourceId: item.id } })">Edit</button><button type="button" @click="remove(item)">×</button></article></section>
  </div>
</template>