<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import LeafCurtainIntro from '@/components/LeafCurtainIntro.vue';

const route = useRoute();
const entranceVisible = ref(false);
const isHome = computed(() => route.name === 'home');
let entranceStarted = false;

function startEntrance() {
  if (!isHome.value || entranceStarted) return;
  entranceStarted = true;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let alreadySeen = false;
  try {
    alreadySeen = window.sessionStorage.getItem('bersantai-grand-entrance-v6') === 'seen';
    if (!alreadySeen) window.sessionStorage.setItem('bersantai-grand-entrance-v6', 'seen');
  } catch (_error) {
    // Private browsing can disable storage; the intro still works for this visit.
  }

  if (reducedMotion || alreadySeen) return;

  entranceVisible.value = true;
}

watch(isHome, startEntrance, { immediate: true });
</script>

<template>
  <Transition name="entrance-dismiss">
    <LeafCurtainIntro v-if="entranceVisible && isHome" @complete="entranceVisible = false" />
  </Transition>
  <RouterView />
</template>
