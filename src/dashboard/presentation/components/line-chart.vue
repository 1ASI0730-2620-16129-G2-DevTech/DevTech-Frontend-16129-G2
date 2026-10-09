<script setup>
import {computed} from "vue";

const props = defineProps({
  /** [{label, value}] in time order. */
  points: {type: Array, default: () => []},
  format: {type: Function, default: (value) => String(value)},
  ariaLabel: {type: String, default: ""}
});

const WIDTH = 280, HEIGHT = 150, LEFT = 12, RIGHT = 12, TOP = 14, BOTTOM = 22;

const positioned = computed(() => {
  const max = Math.max(...props.points.map((point) => point.value), 1);
  const step = (WIDTH - LEFT - RIGHT) / Math.max(props.points.length - 1, 1);
  return props.points.map((point, index) => ({
    ...point,
    x: LEFT + index * step,
    y: HEIGHT - BOTTOM - (point.value / max) * (HEIGHT - TOP - BOTTOM)
  }));
});
const polyline = computed(() => positioned.value.map((point) => `${point.x},${point.y}`).join(" "));
</script>

<template>
  <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" role="img" :aria-label="ariaLabel" class="line-chart">
    <line :x1="0" :x2="WIDTH" :y1="HEIGHT - BOTTOM" :y2="HEIGHT - BOTTOM" class="baseline"/>
    <polyline :points="polyline" class="line"/>
    <g v-for="point in positioned" :key="point.label" class="point">
      <circle :cx="point.x" :cy="point.y" r="12" class="hit">
        <title>{{ point.label }}: {{ format(point.value) }}</title>
      </circle>
      <circle :cx="point.x" :cy="point.y" r="4" class="marker"/>
      <text :x="point.x" :y="HEIGHT - 6" text-anchor="middle" class="axis-label">{{ point.label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.line-chart { display: block; width: 100%; height: auto; }
.baseline { stroke: #dce9f5; stroke-width: 1; }
.line { fill: none; stroke: #2a78d6; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.marker { fill: #2a78d6; stroke: #f5f9fd; stroke-width: 2; pointer-events: none; opacity: 0; }
.hit { fill: transparent; }
.point:hover .marker { opacity: 1; }
.axis-label { fill: #72819b; font-size: 9px; }
</style>
