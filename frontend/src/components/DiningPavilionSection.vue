<script setup>
import { resolveMediaUrl } from '@/services/currency';
import PhotoLightbox from '@/components/PhotoLightbox.vue';
defineProps({ diningVillas: { type: Array, default: () => [] } });
const emit = defineEmits(['book']);
</script>

<template>
  <section v-if="diningVillas.length" class="dining-pavilion-section section-pad" id="dining-pavilion" data-reveal><div class="dining-pavilion-layout"><div class="dining-pavilion-copy"><p class="eyebrow">Bersantai-owned · First stop</p><h2>The Dining<br><em>Pavilion.</em></h2><p>A private dining pavilion with an Infinity Pool, prepared for long lunches, special dinners, and day tours at the heart of Bersantai.</p><div class="dining-pavilion-actions"><RouterLink class="button button-dark" :to="{ name: 'villa-detail', params: { villaId: diningVillas[0].id } }">Explore the pavilion <span aria-hidden="true">↗</span></RouterLink><button class="button button-outline" type="button" @click="emit('book', diningVillas[0])">Book the pavilion <span aria-hidden="true">↗</span></button><a class="text-link" href="#services">Explore the restaurant menu <span aria-hidden="true">↓</span></a></div></div><div class="dining-pavilion-media"><PhotoLightbox :src="diningVillas[0].image" alt="Bersantai Dining Pavilion" /><span>Infinity Pool · Private dining · Day tours</span></div></div></section>
</template>
