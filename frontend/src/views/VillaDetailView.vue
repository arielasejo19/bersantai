<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { villaService } from '@/services/villaService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';

const route = useRoute();
const router = useRouter();
const villa = ref(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try { villa.value = (await villaService.getPublic(route.params.villaId)).villa; }
  catch (requestError) { error.value = requestError.message; }
  finally { loading.value = false; }
});
</script>

<template>
  <main class="villa-detail-page">
    <header class="villa-detail-header"><button class="text-link" type="button" @click="router.push('/')">← Back to villas</button><img :src="'/icons/' + 'bersantai-logo.png'" alt="Bersantai" class="editor-page-logo"></header>
    <section v-if="loading" class="editor-page-loading">Preparing your villa...</section>
    <section v-else-if="error" class="editor-page-loading"><p class="booking-error">{{ error }}</p></section>
    <article v-else-if="villa" class="villa-detail-content">
      <div class="villa-detail-hero"><video v-if="villa.photos?.[0]?.mediaType === 'video'" :src="resolveMediaUrl(villa.photos[0].url)" controls></video><img v-else-if="villa.photos?.[0]?.url" :src="resolveMediaUrl(villa.photos[0].url)" :alt="villa.name"><div v-else class="villa-image-empty">No cover image yet</div></div>
      <div class="villa-detail-copy"><p class="eyebrow">{{ villa.location }}</p><h1>{{ villa.name }}</h1><p class="villa-detail-description">{{ villa.description || 'A private Bersantai stay shaped by the landscape, quiet mornings, and thoughtful hospitality.' }}</p><div class="villa-detail-facts"><span>{{ villa.capacity }} guests</span><span>{{ villa.bedroomCount }} bedrooms</span><span>{{ villa.stayType === 'both' ? 'Day Tour & Overnight' : villa.stayType === 'day_tour' ? 'Day Tour' : 'Overnight Stay' }}</span></div><div class="villa-detail-price">{{ formatCurrency(villa.nightlyPrice) }} <small>/ night</small></div><button class="button villa-detail-book" type="button" @click="router.push({ name: 'booking', query: { villaId: villa.id, villaTypeId: villa.villaType?.id || '' } })">Book this stay <span aria-hidden="true">↗</span></button><div v-if="villa.amenities?.length" class="villa-detail-amenities"><span v-for="amenity in villa.amenities" :key="amenity.id || amenity.name">{{ amenity.name || amenity }}</span></div></div>
    </article>
  </main>
</template>
