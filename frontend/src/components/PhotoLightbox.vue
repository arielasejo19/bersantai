<script setup>
import { ref } from 'vue';
import { resolveMediaUrl } from '@/services/currency';

defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' }
});

const open = ref(false);
</script>

<template>
  <button class="public-photo-trigger" type="button" :aria-label="`View larger: ${alt || 'photo'}`" @click="open = true">
    <img :src="resolveMediaUrl(src)" :alt="alt" loading="lazy">
  </button>
  <Teleport to="body">
    <div v-if="open" class="public-photo-lightbox" role="dialog" aria-modal="true" :aria-label="alt || 'Enlarged photo'" @click.self="open = false">
      <button class="public-photo-lightbox-close" type="button" aria-label="Close enlarged photo" @click="open = false">×</button>
      <img :src="resolveMediaUrl(src)" :alt="alt">
    </div>
  </Teleport>
</template>
