<script setup>
import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useLaundryOperationStore from "@/laundry-operations/application/laundry-operation.store.js";
import LaundryOperationsMenu from "@/laundry-operations/presentation/components/laundry-operations-menu.vue";

const {t} = useI18n();
const store = useLaundryOperationStore();
const {washingCycles, washingCyclesLoaded, errors} = storeToRefs(store);

onMounted(() => {
  if (!store.washingCyclesLoaded) store.fetchWashingCycles();
});
</script>

<template>
  <div>
    <laundry-operations-menu class="mb-4"/>

    <pv-data-table
        :loading="!washingCyclesLoaded"
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        :value="washingCycles"
        paginator
        striped-rows
        table-style="min-width: 40rem">
      <pv-column :header="t('laundry-operations.cycles.name')" field="name" sortable/>
      <pv-column :header="t('laundry-operations.cycles.duration')" field="durationMinutes" sortable/>
      <pv-column :header="t('laundry-operations.cycles.compatible-type')" field="compatibleType" sortable/>
    </pv-data-table>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>

</style>
