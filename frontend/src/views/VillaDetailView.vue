<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { villaService } from '@/services/villaService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';

const route = useRoute();
const router = useRouter();
const villa = ref(null);
const loading = ref(true);
const error = ref('');
const publicSite = ref({ mapUrl: '', location: '', address: '' });
const pricingRules = computed(() => villa.value?.pricingRules || []);
const rateUnit = computed(() => villa.value?.stayType === 'day_tour' ? 'day' : 'night');
const reviews = computed(() => [
  { quote: 'There is a softness to this place that is hard to leave. Every detail felt considered.', guest: 'Aisha R.', location: 'Singapore' },
  { quote: 'The pavilion, the mountain air, and the warm welcome made this one of our most memorable days in Bali.', guest: 'Daniel T.', location: 'Melbourne' },
  { quote: 'Quiet mornings, beautiful views, and a stay that felt completely unhurried.', guest: 'Maya L.', location: 'Jakarta' }
]);
const lightboxIndex = ref(null);
const villaMedia = computed(() => villa.value?.photos || []);
const activeMedia = computed(() => lightboxIndex.value === null ? null : villaMedia.value[lightboxIndex.value]);
function ruleLabel(ruleType) { return { weekday: 'Weekday rate', weekend: 'Weekend rate', holiday: 'Holiday rate' }[ruleType] || 'Flexible rate'; }
function openMedia(index) { lightboxIndex.value = index; }
function closeMedia() { lightboxIndex.value = null; }
function moveMedia(direction) { if (!villaMedia.value.length) return; lightboxIndex.value = (lightboxIndex.value + direction + villaMedia.value.length) % villaMedia.value.length; }
function mapMarkerStyle() { return { left: `${villa.value?.mapX ?? 50}%`, top: `${villa.value?.mapY ?? 50}%` }; }

onMounted(async () => {
  try { const [villaResult, configResult] = await Promise.all([villaService.getPublic(route.params.villaId), villaService.getPublicConfig()]); villa.value = villaResult.villa; publicSite.value = configResult.config.publicSite || publicSite.value; }
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
      <div class="villa-detail-hero"><video v-if="villa.photos?.[0]?.mediaType === 'video'" :src="resolveMediaUrl(villa.photos[0].url)" controls></video><button v-else-if="villa.photos?.[0]?.url" class="villa-detail-media-trigger" type="button" :aria-label="`View ${villa.name} gallery`" @click="openMedia(0)"><img :src="resolveMediaUrl(villa.photos[0].url)" :alt="villa.name"></button><div v-else class="villa-image-empty">No cover image yet</div></div>
      <div class="villa-detail-copy"><p class="eyebrow">{{ villa.location }}</p><h1>{{ villa.name }}</h1><p class="villa-detail-description">{{ villa.description || 'A private Bersantai stay shaped by the landscape, quiet mornings, and thoughtful hospitality.' }}</p><div class="villa-detail-facts"><span>{{ villa.capacity }} guests</span><span>{{ villa.bedroomCount }} bedrooms</span><span>{{ villa.stayType === 'both' ? 'Day Tour & Overnight' : villa.stayType === 'day_tour' ? 'Day Tour' : 'Overnight Stay' }}</span></div><div class="villa-detail-price">{{ formatCurrency(villa.nightlyPrice) }} <small>/ {{ rateUnit }}</small></div><button class="button hero-book-button villa-detail-book" type="button" @click="router.push({ name: 'booking', query: { villaId: villa.id, villaTypeId: villa.villaType?.id || '' } })">Book this stay <span aria-hidden="true">↗</span></button><div v-if="villa.amenities?.length" class="villa-detail-amenities"><span v-for="amenity in villa.amenities" :key="amenity.id || amenity.name">{{ amenity.name || amenity }}</span></div></div>
    </article>
    <section v-if="villa" class="villa-detail-information"><div v-if="villa.photos?.length > 1" class="villa-detail-gallery"><p class="eyebrow">A closer look</p><div><button v-for="(photo, index) in villa.photos" :key="photo.id || photo.url || index" class="villa-detail-gallery-trigger" type="button" :aria-label="`View ${villa.name} photo ${index + 1}`" @click="openMedia(index)"><video v-if="photo.mediaType === 'video'" :src="resolveMediaUrl(photo.url)" muted></video><img v-else :src="resolveMediaUrl(photo.url)" :alt="`${villa.name} photo ${index + 1}`"></button></div></div><div class="villa-detail-information-grid"><section><p class="eyebrow">Stay details</p><h2>Prepared for your arrival</h2><dl><div><dt>Check-in</dt><dd>{{ villa.standardCheckIn || '15:00' }}</dd></div><div><dt>Check-out</dt><dd>{{ villa.standardCheckOut || '11:00' }}</dd></div><div><dt>Villa type</dt><dd>{{ villa.villaType?.name || 'Private villa' }}</dd></div></dl></section><section><p class="eyebrow">Flexible rates</p><h2>Rates that follow the season</h2><div v-if="pricingRules.length" class="villa-detail-rules"><article v-for="rule in pricingRules" :key="rule.id"><div><strong>{{ rule.name }}</strong><small>{{ ruleLabel(rule.ruleType) }}<span v-if="rule.startsOn"> · {{ rule.startsOn }}<span v-if="rule.endsOn"> to {{ rule.endsOn }}</span></span></small></div><b>{{ formatCurrency(rule.price) }}<small>/ {{ rule.stayType === 'day_tour' ? 'day' : 'night' }}</small></b></article></div><p v-else class="villa-detail-muted">This stay follows its base {{ rateUnit }} rate.</p></section></div><section v-if="publicSite.mapUrl" class="villa-vicinity-section"><div><p class="eyebrow">Around Bersantai</p><h2>Find your way to us.</h2><p>{{ publicSite.location }} · {{ publicSite.address }}</p><a class="text-link" :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${villa.location}, Bali, Indonesia`)}`" target="_blank" rel="noopener">Open in Google Maps <span aria-hidden="true">↗</span></a></div><div class="public-vicinity-map"><img :src="resolveMediaUrl(publicSite.mapUrl)" alt="Bersantai vicinity map"><span class="public-map-marker" :style="mapMarkerStyle()" aria-label="Selected villa location">●</span></div></section><section class="villa-reviews-section"><div class="villa-reviews-heading"><div><p class="eyebrow">Guest notes</p><h2>Stays remembered.</h2></div><span>★★★★★</span></div><div class="villa-reviews-grid"><article v-for="review in reviews" :key="review.guest"><p>“{{ review.quote }}”</p><strong>{{ review.guest }}</strong><small>{{ review.location }}</small></article></div></section></section>
    <div v-if="activeMedia" class="villa-detail-media-lightbox" role="dialog" aria-modal="true" aria-label="Villa media viewer" tabindex="0" @keydown.left.prevent="moveMedia(-1)" @keydown.right.prevent="moveMedia(1)" @keydown.esc="closeMedia" @click.self="closeMedia"><button class="villa-detail-media-close" type="button" aria-label="Close gallery" @click="closeMedia">×</button><button class="villa-detail-media-prev" type="button" aria-label="Previous media" @click="moveMedia(-1)">‹</button><video v-if="activeMedia.mediaType === 'video'" :src="resolveMediaUrl(activeMedia.url)" controls autoplay></video><img v-else :src="resolveMediaUrl(activeMedia.url)" :alt="`${villa.name} photo ${lightboxIndex + 1}`"><button class="villa-detail-media-next" type="button" aria-label="Next media" @click="moveMedia(1)">›</button><span class="villa-detail-media-count">{{ lightboxIndex + 1 }} / {{ villaMedia.length }}</span></div>
  </main>
</template>
