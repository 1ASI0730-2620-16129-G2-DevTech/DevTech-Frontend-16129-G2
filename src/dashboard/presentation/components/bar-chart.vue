<script setup>
import {computed} from "vue";

const props = defineProps({
  /** [{label, value}] in display order. */
  points: {type: Array, default: () => []},
  /** Formats a value for the hover tooltip. */
  format: {type: Function, default: (value) => String(value)},
  ariaLabel: {type: String, default: ""}
});

const WIDTH = 280, HEIGHT = 150, TOP = 12, BOTTOM = 22, GAP = 10;

const bars = computed(() => {
  const max = Math.max(...props.points.map((point) => point.value), 1);
  const slot = WIDTH / Math.max(props.points.length, 1);
  const width = Math.max(slot - GAP, 4);
  return props.points.map((point, index) => {
    const height = (point.value / max) * (HEIGHT - TOP - BOTTOM);
    return {...point, x: index * slot + GAP / 2, width, height, y: HEIGHT - BOTTOM - height, center: index * slot + slot / 2};
  });
});

/** Bar with its top corners rounded (4px) and a flat base on the axis. */
function barPath(bar) {
  if (bar.height <= 0) return "";
  const r = Math.min(4, bar.width / 2, bar.height);
  const {x, y, width, height} = bar;
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
}
</script>

<template>
  <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" role="img" :aria-label="ariaLabel" class="bar-chart">
    <line :x1="0" :x2="WIDTH" :y1="HEIGHT - BOTTOM" :y2="HEIGHT - BOTTOM" class="baseline"/>
    <g v-for="bar in bars" :key="bar.label" class="bar">
      <!-- Full-height hit area so short bars are easy to hover. -->
      <rect :x="bar.x" :y="TOP" :width="bar.width" :height="HEIGHT - TOP - BOTTOM" class="hit">
        <title>{{ bar.label }}: {{ format(bar.value) }}</title>
      </rect>
      <path :d="barPath(bar)" class="mark"/>
      <text :x="bar.center" :y="HEIGHT - 6" text-anchor="middle" class="axis-label">{{ bar.label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.bar-chart { display: block; width: 100%; height: auto; }
.baseline { stroke: #dce9f5; stroke-width: 1; }
.mark { fill: #2a78d6; pointer-events: none; }
.hit { fill: transparent; }
.bar:hover .mark { fill: #1c5cab; }
.axis-label { fill: #72819b; font-size: 9px; }
</style>
