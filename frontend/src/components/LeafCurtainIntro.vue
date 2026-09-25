<script setup>
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['complete']);

const leaves = [
  { file: 'leaf-01.png', className: 'leaf-curtain-one', delay: '.35s', duration: '4.05s', depth: 'foreground' },
  { file: 'leaf-02.png', className: 'leaf-curtain-two', delay: '.6s', duration: '4.25s', depth: 'midground' },
  { file: 'leaf-03.png', className: 'leaf-curtain-three', delay: '.48s', duration: '4.1s', depth: 'foreground' },
  { file: 'leaf-04.png', className: 'leaf-curtain-four', delay: '.86s', duration: '3.95s', depth: 'background' },
  { file: 'leaf-05.png', className: 'leaf-curtain-five', delay: '.7s', duration: '4.2s', depth: 'midground' },
  { file: 'leaf-06.png', className: 'leaf-curtain-six', delay: '.55s', duration: '3.95s', depth: 'foreground' },
  { file: 'leaf-07.png', className: 'leaf-curtain-seven', delay: '1s', duration: '3.95s', depth: 'midground' },
  { file: 'left-08.png', className: 'leaf-curtain-eight', delay: '.8s', duration: '4.2s', depth: 'background' },
  { file: 'left-09.png', className: 'leaf-curtain-nine', delay: '1.08s', duration: '3.95s', depth: 'foreground' }
];

let completeTimer;

onMounted(() => {
  completeTimer = window.setTimeout(() => emit('complete'), 5250);
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
