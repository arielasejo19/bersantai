<script setup>
import { computed } from 'vue';

const props = defineProps({ reservations: { type: Array, default: () => [] }, villas: { type: Array, default: () => [] }, startDate: { type: String, default: '' }, endDate: { type: String, default: '' } });
const emit = defineEmits(['select']);
const dayMs = 86400000;
function dateValue(value) { const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`); return Number.isNaN(date.getTime()) ? null : date; }
function keyFor(date) { return date.toISOString().slice(0, 10); }
function addDays(date, amount) { const next = new Date(date); next.setUTCDate(next.getUTCDate() + amount); return next; }
const bounds = computed(() => {
  const dates = props.reservations.flatMap((reservation) => [dateValue(reservation.check_in), dateValue(reservation.check_out)]).filter(Boolean);
  const defaultStart = dates.length ? dates.reduce((earliest, date) => date < earliest ? date : earliest, dates[0]) : dateValue(new Date().toISOString());
  const defaultEnd = dates.length ? dates.reduce((latest, date) => date > latest ? date : latest, dates[0]) : addDays(defaultStart, 14);
  const start = dateValue(props.startDate) || defaultStart;
  const end = dateValue(props.endDate) || defaultEnd;
  return { start, end: end > start ? end : addDays(start, 1) };
});
const days = computed(() => { const result = []; for (let cursor = bounds.value.start; cursor <= bounds.value.end; cursor = addDays(cursor, 1)) result.push(new Date(cursor)); return result; });
const rows = computed(() => {
  const grouped = new Map();
  props.villas.forEach((villa) => grouped.set(String(villa.id), { id: String(villa.id), name: villa.name, reservations: [] }));
  props.reservations.forEach((reservation) => {
    const villaId = reservation.villa_id ? String(reservation.villa_id) : `unassigned-${reservation.villa_type_name || 'room'}`;
    if (!grouped.has(villaId)) grouped.set(villaId, { id: villaId, name: reservation.villa_name || reservation.villa_type_name || 'Awaiting room assignment', reservations: [] });
    grouped.get(villaId).reservations.push(reservation);
  });
  return [...grouped.values()];
});
const timelineWidth = computed(() => Math.max(720, days.value.length * 62));
function dayLabel(date) { return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }); }
function barStyle(reservation) {
  const start = dateValue(reservation.check_in) || bounds.value.start;
  const end = dateValue(reservation.check_out) || addDays(start, 1);
  const left = Math.max(0, (start - bounds.value.start) / dayMs);
  const width = Math.max(1, (end - start) / dayMs);
  return { left: `${(left / days.value.length) * 100}%`, width: `${(width / days.value.length) * 100}%` };
}
function statusClass(reservation) { return `reservation-bar-${reservation.booking_status || 'pending'}`; }
</script>

<template>
  <section class="reservation-gantt-panel"><div class="gantt-heading"><div><span class="eyebrow">Room timeline</span><h3>Reservation calendar</h3></div><span>{{ reservations.length }} bookings · {{ days.length }} days</span></div><div v-if="!reservations.length" class="empty-state">No reservations to plot yet.</div><div v-else class="gantt-scroll"><div class="reservation-gantt" :style="{ minWidth: `${timelineWidth + 185}px` }"><div class="gantt-header"><div class="gantt-room-heading">Rooms</div><div class="gantt-days" :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(62px, 1fr))` }"><span v-for="day in days" :key="keyFor(day)" :class="{ weekend: [0, 6].includes(day.getUTCDay()) }">{{ dayLabel(day) }}</span></div></div><div v-for="row in rows" :key="row.id" class="gantt-row"><div class="gantt-room-name">{{ row.name }}</div><div class="gantt-track" :style="{ backgroundSize: `${100 / days.length}% 100%` }"><article v-for="reservation in row.reservations" :key="reservation.id" class="reservation-gantt-bar" :class="statusClass(reservation)" :style="barStyle(reservation)" role="button" tabindex="0" @click="emit('select', reservation)" @keydown.enter="emit('select', reservation)"><strong>{{ reservation.guest_name }}</strong><small>{{ reservation.booking_status }}</small></article></div></div></div></div><div class="gantt-legend"><span><i class="reservation-bar-pending"></i> Pending</span><span><i class="reservation-bar-confirmed"></i> Confirmed</span><span><i class="reservation-bar-checked_in"></i> Checked in</span><span><i class="reservation-bar-cancelled"></i> Cancelled</span></div></section>
</template>
