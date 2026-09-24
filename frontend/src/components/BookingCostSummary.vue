<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/services/currency';

const props = defineProps({
  stayTotal: { type: Number, default: 0 },
  servicesTotal: { type: Number, default: 0 },
  menuTotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const hasAddons = computed(() => props.servicesTotal > 0 || props.menuTotal > 0);
</script>

<template>
  <aside class="booking-cost-summary" aria-label="Booking cost summary">
    <p class="eyebrow">Your stay</p>
    <h2>Running total</h2>
    <dl>
      <div><dt>Villa stay</dt><dd>{{ formatCurrency(stayTotal) }}</dd></div>
      <div v-if="hasAddons"><dt>Services</dt><dd>{{ formatCurrency(servicesTotal) }}</dd></div>
      <div v-if="hasAddons"><dt>Menu</dt><dd>{{ formatCurrency(menuTotal) }}</dd></div>
    </dl>
    <div class="booking-cost-total"><span>Estimated total</span><strong>{{ formatCurrency(total) }}</strong></div>
    <small>Final amount may change if dates or quantities are updated.</small>
  </aside>
</template>
