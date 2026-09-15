<script setup>
defineProps({
  villa: { type: Object, required: true }
});

const emit = defineEmits(['book']);
</script>

<template>
  <article class="villa-card">
    <div class="villa-image"><video v-if="villa.mediaType === 'video'" :src="villa.image" muted controls preload="metadata" :aria-label="`${villa.name} video`"></video><img v-else :src="villa.image" :alt="`${villa.name} in ${villa.location}`" loading="lazy"><span class="villa-save" aria-label="Save villa">♡</span></div>
    <div class="villa-info"><div><h3>{{ villa.name }}</h3><p>{{ villa.location }} · {{ villa.detail }}</p><small v-if="villa.amenities?.length" class="villa-amenities">{{ villa.amenities.slice(0, 3).map((amenity) => amenity.name || amenity).join(' · ') }}</small></div><strong>{{ villa.price }}<small> / night</small></strong></div><button class="villa-book" type="button" @click="emit('book')">Book this stay <span aria-hidden="true">↗</span></button>
  </article>
</template>