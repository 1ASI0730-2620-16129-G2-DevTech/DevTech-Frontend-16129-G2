<script setup>
import {computed} from "vue";

const props = defineProps({
  /** [{label, value}] already ordered from highest to lowest. */
  items: {type: Array, default: () => []}
});

const max = computed(() => Math.max(...props.items.map((item) => item.value), 1));
</script>

<template>
  <ol class="ranking">
    <li v-for="item in items" :key="item.label" :title="`${item.label}: ${item.value}`">
      <div class="row-text"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
      <div class="track"><div class="fill" :style="{width: `${(item.value / max) * 100}%`}"></div></div>
    </li>
  </ol>
</template>

<style scoped>
.ranking { display: flex; flex-direction: column; gap: .7rem; margin: 0; padding: 0; list-style: none; }
.row-text { display: flex; justify-content: space-between; gap: .5rem; margin-bottom: .25rem; color: #1b2f55; font-size: .72rem; }
.row-text strong { color: #123b7a; }
.track { height: .6rem; border-radius: 4px; background: #e8eef6; }
.fill { height: 100%; border-radius: 4px; background: #2a78d6; }
li:hover .fill { background: #1c5cab; }
</style>
