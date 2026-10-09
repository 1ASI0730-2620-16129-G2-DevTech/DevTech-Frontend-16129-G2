<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {DemandPeriod, mostRequested} from "../../domain/model/demand-period.js";

const props = defineProps({
  /** Services or garments; each one knows how to count itself in an order (demandIn). */
  items: {type: Array, default: () => []},
  orders: {type: Array, default: () => []},
  /** i18n key of the title, receives {period}. */
  titleKey: {type: String, required: true}
});

const {t} = useI18n();
const period = ref(DemandPeriod.DAY);
const periods = Object.values(DemandPeriod);

const result = computed(() => mostRequested(props.items, props.orders, period.value));

const WIDTH = 880, HEIGHT = 150, PADDING_X = 15, PADDING_TOP = 20, PADDING_BOTTOM = 15;
const points = computed(() => {
  const series = result.value.series;
  const max = Math.max(...series, 1);
  const step = (WIDTH - 2 * PADDING_X) / (series.length - 1);
  return series.map((value, index) => {
    const x = PADDING_X + index * step;
    const y = HEIGHT - PADDING_BOTTOM - (value / max) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
});
</script>

<template>
  <section class="demand-chart">
    <div class="chart-heading">
      <h2>{{ t(titleKey, {period: t(`catalog.period-titles.${period.key}`)}) }}</h2>
      <div class="period-filters" role="group">
        <button v-for="option in periods" :key="option.key" type="button"
                :class="{selected: option === period}" :aria-pressed="option === period" @click="period = option">
          {{ t(`catalog.periods.${option.key}`) }}
        </button>
      </div>
    </div>
    <div class="chart-area">
      <template v-if="result.item">
        <p class="top-item">{{ t('catalog.chart-top', {name: result.item.name, total: result.total}) }}</p>
        <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" preserveAspectRatio="none" role="img"
             :aria-label="t('catalog.chart-top', {name: result.item.name, total: result.total})">
          <polyline :points="points"/>
        </svg>
      </template>
      <p v-else class="chart-empty">{{ t('catalog.chart-empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
.demand-chart { margin-top: 2.5rem; }
.chart-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 .65rem; }
h2 { margin: 0; font-size: .9rem; font-weight: 700; color: #123b7a; }
.period-filters { display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
.period-filters button { border: 0; border-radius: 1rem; padding: .3rem .7rem; background: #f5f9fd; color: #72819b;
  font-size: .68rem; cursor: pointer; }
.period-filters button.selected { background: #087fea; color: #fff; }
.chart-area { position: relative; height: 11rem; padding: 1rem .75rem; border-radius: 8px; background: #f4f9fd; }
.chart-area svg { width: 100%; height: calc(100% - 1.2rem); overflow: visible; }
.chart-area polyline { fill: none; stroke: #f59b00; stroke-width: 2.5; vector-effect: non-scaling-stroke;
  stroke-linejoin: round; stroke-linecap: round; }
.top-item { margin: 0; color: #72819b; font-size: .7rem; font-weight: 600; }
.chart-empty { display: grid; place-items: center; height: 100%; margin: 0; color: #72819b; font-size: .75rem; }
@media (max-width: 700px) { .chart-heading { align-items: flex-start; flex-direction: column; } }
</style>
