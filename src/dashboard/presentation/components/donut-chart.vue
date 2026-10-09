<script setup>
import {computed} from "vue";

const props = defineProps({
  /** [{label, value, color}] in a fixed order; the color follows the category, never its rank. */
  slices: {type: Array, default: () => []},
  totalLabel: {type: String, default: ""}
});

const RADIUS = 40, STROKE = 16, CIRCUMFERENCE = 2 * Math.PI * RADIUS, GAP = 2;

const total = computed(() => props.slices.reduce((sum, slice) => sum + slice.value, 0));

/** Each non-empty slice as a dash of the ring, starting at 12 o'clock, with a 2px gap between slices. */
const arcs = computed(() => {
  let offset = 0;
  return props.slices.filter((slice) => slice.value > 0).map((slice) => {
    const length = (slice.value / total.value) * CIRCUMFERENCE;
    const visible = total.value === slice.value ? length : Math.max(length - GAP, 0.5);
    const arc = {...slice, dasharray: `${visible} ${CIRCUMFERENCE - visible}`, dashoffset: -offset};
    offset += length;
    return arc;
  });
});
</script>

<template>
  <div class="donut">
    <svg viewBox="0 0 100 100" role="img" :aria-label="`${totalLabel}: ${total}`">
      <g transform="rotate(-90 50 50)">
        <circle cx="50" cy="50" :r="RADIUS" class="track"/>
        <circle v-for="arc in arcs" :key="arc.label" cx="50" cy="50" :r="RADIUS" class="arc"
                :stroke="arc.color" :stroke-dasharray="arc.dasharray" :stroke-dashoffset="arc.dashoffset">
          <title>{{ arc.label }}: {{ arc.value }}</title>
        </circle>
      </g>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" class="total">{{ total }}</text>
    </svg>
    <ul class="legend">
      <li v-for="slice in slices" :key="slice.label">
        <span class="swatch" :style="{background: slice.color}" aria-hidden="true"></span>
        <span class="legend-label">{{ slice.label }}</span>
        <strong>{{ slice.value }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut { display: flex; align-items: center; gap: 1rem; }
svg { flex: 0 0 7.5rem; width: 7.5rem; height: 7.5rem; }
.track { fill: none; stroke: #e8eef6; stroke-width: 16; }
.arc { fill: none; stroke-width: 16; }
.arc:hover { stroke-width: 19; }
.total { fill: #123b7a; font-size: 18px; font-weight: 700; }
.legend { display: flex; flex-direction: column; gap: .3rem; margin: 0; padding: 0; list-style: none; font-size: .68rem; color: #1b2f55; }
.legend li { display: flex; align-items: center; gap: .4rem; }
.legend-label { flex: 1; }
.legend strong { color: #123b7a; }
.swatch { width: .6rem; height: .6rem; border-radius: 2px; flex: 0 0 auto; }
</style>
