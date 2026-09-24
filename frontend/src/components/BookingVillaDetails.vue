<script setup>
import { computed, ref } from 'vue';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';

const props = defineProps({ villa: { type: Object, required: true } });
const lightboxPhoto = ref(null);
const photos = computed(() => {
  if (props.villa.photos?.length) return props.villa.photos;
  const type = props.villa.villaType;
  const gallery = type?.galleryUrls || [];
  return gallery.map((url) => ({ url, mediaType: 'image' }));
});
const amenities = computed(() => (props.villa.amenities?.length ? props.villa.amenities : props.villa.villaType?.amenities || []).map((item) => item.name || item));
const stayType = computed(() => props.villa.stayType === 'day_tour' || props.villa.villaType?.dayTourOnly ? 'Day tour only' : props.villa.stayType === 'overnight' ? 'Overnight stay' : 'Day tour & overnight');
const checkIn = computed(() => props.villa.standardCheckIn || props.villa.villaType?.standardCheckIn || '15:00');
const checkOut = computed(() => props.villa.standardCheckOut || props.villa.villaType?.standardCheckOut || '11:00');
</script>

<template>
  <aside class="booking-villa-details-full"><div class="booking-villa-details-title"><p class="eyebrow">Your selected stay</p><h2>{{ villa.name }}</h2><p>{{ villa.location }}</p></div><div v-if="photos.length" class="booking-villa-gallery"><div v-for="(photo, index) in photos" :key="photo.id || photo.url || index" class="booking-villa-gallery-item"><video v-if="photo.mediaType === 'video'" :src="resolveMediaUrl(photo.url)" muted controls></video><button v-else class="booking-villa-gallery-trigger" type="button" :aria-label="`Enlarge ${villa.name} photo ${index + 1}`" @click="lightboxPhoto = photo"><img :src="resolveMediaUrl(photo.url)" :alt="`${villa.name} photo ${index + 1}`"></button></div></div><div v-else class="booking-villa-gallery-empty">No photos available yet.</div><p class="booking-villa-description">{{ villa.description || 'A private Bersantai stay prepared for your arrival.' }}</p><div class="booking-villa-facts"><span><strong>{{ villa.capacity }}</strong> guests</span><span><strong>{{ villa.bedroomCount }}</strong> bedrooms</span><span><strong>{{ stayType }}</strong></span></div><div class="booking-villa-rate"><span>Base nightly rate</span><strong>{{ formatCurrency(villa.nightlyPrice || villa.villaType?.nightlyPrice) }}</strong></div><div class="booking-villa-times"><span>Check-in <strong>{{ checkIn }}</strong></span><span>Check-out <strong>{{ checkOut }}</strong></span></div><div v-if="amenities.length" class="booking-villa-amenities"><h3>Amenities</h3><span v-for="amenity in amenities" :key="amenity">{{ amenity }}</span></div></aside>
  <div v-if="lightboxPhoto" class="booking-photo-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged villa photo" @click.self="lightboxPhoto = null"><button type="button" aria-label="Close enlarged photo" @click="lightboxPhoto = null">×</button><img :src="resolveMediaUrl(lightboxPhoto.url)" :alt="`${villa.name} enlarged photo`"></div>
</template>
