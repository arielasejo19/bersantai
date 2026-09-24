<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { menuService } from '@/services/menuService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';
import MediaUploadField from '@/components/MediaUploadField.vue';

const items = ref([]);
const router = useRouter();
const categories = ref([]);
const selected = ref(null);
const saving = ref(false);
const mediaFile = ref(null);
const error = ref('');
const form = reactive({ name: '', slug: '', description: '', imageUrl: '', mediaType: 'image', categoryId: '', mealOfDay: '', price: 0, isAvailable: true, isActive: true });
const categoryForm = reactive({ name: '', slug: '', isActive: true });

function reset() { selected.value = null; mediaFile.value = null; Object.assign(form, { name: '', slug: '', description: '', imageUrl: '', mediaType: 'image', categoryId: '', mealOfDay: '', price: 0, isAvailable: true, isActive: true }); }
function edit(item) { selected.value = item; Object.assign(form, { ...item, categoryId: item.categoryId || '' }); }
async function load() { const [itemResult, categoryResult] = await Promise.all([menuService.list(), menuService.categories()]); items.value = itemResult.menuItems; categories.value = categoryResult.categories; }
async function save() { saving.value = true; error.value = ''; try { const payload = { ...form, categoryId: form.categoryId || null, mealOfDay: form.mealOfDay || null, price: Number(form.price), imageUrl: form.imageUrl || null }; const result = selected.value ? await menuService.update(selected.value.id, payload) : await menuService.create(payload); if (mediaFile.value) { const data = new FormData(); data.append('media', mediaFile.value); await menuService.uploadMedia(result.menuItem.id, data); } reset(); await load(); } catch (requestError) { error.value = requestError.message; } finally { saving.value = false; } }
async function addCategory() { if (!categoryForm.name || !categoryForm.slug) return; try { await menuService.createCategory(categoryForm); Object.assign(categoryForm, { name: '', slug: '', isActive: true }); await load(); } catch (requestError) { error.value = requestError.message; } }
async function remove(item) { if (!window.confirm(`Remove ${item.name}?`)) return; try { await menuService.remove(item.id); await load(); } catch (requestError) { error.value = requestError.message; } }
onMounted(async () => { try { await load(); } catch (requestError) { error.value = requestError.message; } });
</script>

<template>
  <div class="dashboard-toolbar"><div><h2>Menus / Foods</h2><p>Keep the kitchen offering current across every Bersantai stay.</p></div><button class="dashboard-primary" type="button" @click="router.push({ name: 'menu-create' })">＋ Add food</button></div>
  <p v-if="error" class="management-error" role="alert">{{ error }}</p>
  <div class="menu-management-layout">
    <section class="account-form-panel menu-editor-panel"><div class="menu-panel-heading"><div><span class="eyebrow">Menu workspace</span><h3>Manage your food list</h3></div></div><div class="menu-quick-note">Add and edit foods on their dedicated editor page. Use this list to scan availability, meal timing, and pricing.</div><div class="category-creator"><span class="eyebrow">Add a custom category</span><form class="menu-category-form" @submit.prevent="addCategory"><input v-model="categoryForm.name" placeholder="Category name"><input v-model="categoryForm.slug" placeholder="category-slug"><button type="submit">＋ Add</button></form></div></section>
    <section class="accounts-panel menu-list-panel"><div class="account-toolbar"><div><h3>Food menu</h3><span>{{ items.length }} items · {{ categories.length }} categories</span></div></div><p v-if="!items.length" class="empty-state">No food items yet.</p><div v-else class="menu-admin-list"><article v-for="item in items" :key="item.id" class="menu-admin-row"><div class="menu-admin-image"><img v-if="item.imageUrl" :src="resolveMediaUrl(item.imageUrl)" :alt="item.name"><span v-else aria-hidden="true">✦</span></div><div class="menu-admin-copy"><strong>{{ item.name }}</strong><small>{{ item.category?.name || 'Uncategorized' }}<template v-if="item.mealOfDay"> · {{ item.mealOfDay.replace('-', ' ') }}</template></small></div><strong class="menu-admin-price">{{ formatCurrency(item.price) }}</strong><span class="menu-admin-status" :class="{ inactive: !item.isActive || !item.isAvailable }">{{ item.isActive && item.isAvailable ? 'Active' : 'Hidden' }}</span><button class="menu-row-action" type="button" @click="router.push({ name: 'menu-edit', params: { resourceId: item.id } })">Edit</button><button class="menu-row-delete" type="button" @click="remove(item)" aria-label="Delete menu item">×</button></article></div></section>
  </div>
</template>