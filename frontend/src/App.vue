<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import LeafCurtainIntro from '@/components/LeafCurtainIntro.vue';

const route = useRoute();
const entranceVisible = ref(false);
const isHome = computed(() => route.name === 'home');
let leaveTimer;
let removeTimer;
let entranceStarted = false;

function closeEntrance() {
  window.clearTimeout(leaveTimer);
  window.clearTimeout(removeTimer);
  removeTimer = window.setTimeout(() => {
    entranceVisible.value = false;
  }, 700);
}

function startEntrance() {
  if (!isHome.value || entranceStarted) return;
  entranceStarted = true;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let alreadySeen = false;
  try {
    alreadySeen = window.sessionStorage.getItem('bersantai-grand-entrance-v5') === 'seen';
    if (!alreadySeen) window.sessionStorage.setItem('bersantai-grand-entrance-v5', 'seen');
  } catch (_error) {
    // Private browsing can disable storage; the intro still works for this visit.
  }

  if (reducedMotion || alreadySeen) return;

  entranceVisible.value = true;
}

watch(isHome, startEntrance, { immediate: true });

onUnmounted(() => {
  window.clearTimeout(leaveTimer);
  window.clearTimeout(removeTimer);
});
</script>

<template>
  <LeafCurtainIntro v-if="entranceVisible && isHome" @complete="entranceVisible = false" />
  <RouterView />
</template>
