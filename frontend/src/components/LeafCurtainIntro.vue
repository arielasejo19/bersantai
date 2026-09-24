<script setup>
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['complete']);

const leaves = [
  { file: 'leaf-01.png', className: 'leaf-curtain-one', delay: '.55s', duration: '3.7s', depth: 'foreground' },
  { file: 'leaf-02.png', className: 'leaf-curtain-two', delay: '.82s', duration: '3.5s', depth: 'midground' },
  { file: 'leaf-03.png', className: 'leaf-curtain-three', delay: '.68s', duration: '3.9s', depth: 'foreground' },
  { file: 'leaf-04.png', className: 'leaf-curtain-four', delay: '1.05s', duration: '3.6s', depth: 'background' },
  { file: 'leaf-05.png', className: 'leaf-curtain-five', delay: '.95s', duration: '3.8s', depth: 'midground' },
  { file: 'leaf-06.png', className: 'leaf-curtain-six', delay: '.72s', duration: '3.4s', depth: 'foreground' },
  { file: 'leaf-07.png', className: 'leaf-curtain-seven', delay: '1.18s', duration: '3.5s', depth: 'midground' },
  { file: 'leaf-08.png', className: 'leaf-curtain-eight', delay: '.9s', duration: '3.8s', depth: 'background' },
  { file: 'leaf-09.png', className: 'leaf-curtain-nine', delay: '1.28s', duration: '3.3s', depth: 'foreground' }
];

let completeTimer;

onMounted(() => {
  completeTimer = window.setTimeout(() => emit('complete'), 4900);
});

onUnmounted(() => window.clearTimeout(completeTimer));
</script>

<template>
  <div class="leaf-curtain-intro" role="status" aria-label="Entering Bersantai">
    <div class="leaf-curtain-warmth" aria-hidden="true"></div>
    <div class="leaf-curtain-ornament" aria-hidden="true"></div>
    <div class="leaf-curtain-brand">
      <img src="/icons/bersantai-logo.png" alt="Bersantai">
      <span>Stay. Breathe. Belong.</span>
    </div>
    <div class="leaf-curtain-layers" aria-hidden="true">
      <img
        v-for="leaf in leaves"
        :key="leaf.file"
        :class="['leaf-curtain-leaf', leaf.className, `leaf-curtain-${leaf.depth}`]"
        :src="`/images/entrance/leaves/${leaf.file}`"
        alt=""
        :style="{ '--leaf-delay': leaf.delay, '--leaf-duration': leaf.duration }"
      >
    </div>
    <button class="leaf-curtain-skip" type="button" @click="emit('complete')">Skip intro <span aria-hidden="true">↗</span></button>
  </div>
</template>
