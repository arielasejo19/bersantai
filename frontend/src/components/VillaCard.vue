<script setup>
import { resolveMediaUrl, formatCurrency } from '@/services/currency';
defineProps({
  villa: { type: Object, required: true }
});

const emit = defineEmits(['book', 'explore']);
</script>

<template>
  <article class="villa-card">
    <div class="villa-image"><template v-if="villa.image"><video v-if="villa.mediaType === 'video'" :src="resolveMediaUrl(villa.image)" muted controls preload="metadata" :aria-label="`${villa.name} video`"></video><img v-else :src="resolveMediaUrl(villa.image)" :alt="`${villa.name} in ${villa.location}`" loading="lazy"></template><div v-else class="villa-image-empty">No cover image yet</div><span class="villa-save" aria-label="Save villa">♡</span></div>
    <div class="villa-info"><div><h3>{{ villa.name }}</h3><p>{{ villa.location }} · {{ villa.detail }}</p><small v-if="villa.amenities?.length" class="villa-amenities">{{ villa.amenities.slice(0, 3).map((amenity) => amenity.name || amenity).join(' · ') }}</small></div><strong>{{ villa.price || formatCurrency(villa.nightlyPrice) }}<small> / night</small></strong></div><div class="villa-card-actions"><button class="villa-explore" type="button" @click="emit('explore')">Explore <span aria-hidden="true">↗</span></button><button class="villa-book" type="button" @click="emit('book')">Book this stay <span aria-hidden="true">↗</span></button></div>
  </article>
</template>