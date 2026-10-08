<script setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useLaundryOperationsStore from "@/laundry-operations/application/laundry-operations.store.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";
import LaundryOperationsMenu from "@/laundry-operations/presentation/components/laundry-operations-menu.vue";

const {t} = useI18n();
const store = useLaundryOperationsStore();
const {laundryResources, laundryResourcesLoaded, errors} = storeToRefs(store);

const severityByStatus = {AVAILABLE: 'success', BUSY: 'warn', MAINTENANCE: 'danger'};
const colorByStatus = {
  AVAILABLE: 'var(--wt-success)',
  BUSY: 'var(--wt-warning)',
  MAINTENANCE: 'var(--wt-danger)'
};

const countByStatus = computed(() => Object.values(ResourceStatus).map(status => ({
  status,
  total: laundryResources.value.filter(resource => resource.status === status).length
})));

onMounted(() => {
  if (!store.laundryResourcesLoaded) store.fetchLaundryResources();
});
</script>

<template>
  <div>
    <laundry-operations-menu class="mb-4"/>

    <div class="status-cards mb-4">
      <div v-for="item in countByStatus" :key="item.status" class="status-card">
        <span class="status-label">
          <span class="dot" :style="{background: colorByStatus[item.status]}"></span>
          {{ t('laundry-operations.resource-status.' + item.status) }}
        </span>
        <strong class="status-total">{{ item.total }}</strong>
      </div>
    </div>

    <pv-data-table
        :loading="!laundryResourcesLoaded"
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        :value="laundryResources"
        paginator
        striped-rows
        table-style="min-width: 40rem">
      <pv-column :header="t('laundry-operations.resources.name')" field="name" sortable/>
      <pv-column :header="t('laundry-operations.resources.capacity')" field="capacity" sortable/>
      <pv-column :header="t('laundry-operations.resources.status')" field="status" sortable>
        <template #body="slotProps">
          <pv-tag :value="t('laundry-operations.resource-status.' + slotProps.data.status)"
                  :severity="severityByStatus[slotProps.data.status]"/>
        </template>
      </pv-column>
    </pv-data-table>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--wt-surface);
}

.status-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-total {
  font-size: 1.75rem;
  color: var(--wt-primary);
}
</style>
