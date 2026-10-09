<script setup>
import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useLaundryOperationStore from "@/laundry-operations/application/laundry-operations.store.js";

const {t} = useI18n();
const store = useLaundryOperationStore();
const {summary} = storeToRefs(store);

onMounted(() => {
  if (!store.laundryOrdersLoaded) store.fetchLaundryOrders();
});

const cards = [
  {key: 'pending', color: 'var(--wt-warning)'},
  {key: 'inProcess', color: 'var(--wt-secondary)'},
  {key: 'ready', color: 'var(--wt-success)'},
  {key: 'vip', color: 'var(--wt-primary)'},
  {key: 'atRisk', color: 'var(--wt-danger)'}
];
</script>

<template>
  <div class="kpis">
    <div v-for="card in cards" :key="card.key" class="kpi">
      <span class="kpi-label">{{ t('laundry-operations.summary.' + card.key) }}</span>
      <strong class="kpi-value" :style="{color: card.color}">{{ summary[card.key] }}</strong>
    </div>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--wt-white);
  box-shadow: 0 1px 6px rgba(18, 59, 122, 0.12);
}

.kpi-label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color, #6b7280);
}

.kpi-value {
  font-size: 1.75rem;
}
</style>
