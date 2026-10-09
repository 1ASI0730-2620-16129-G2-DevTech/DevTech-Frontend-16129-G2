<script setup>
import {useI18n} from "vue-i18n";
import {formatDateTime, getStatusSeverity} from "../delivery-helpers.js";
import {useBoardSearch} from "@/shared/presentation/board-search.js";

defineProps({
  deliveries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const { t } = useI18n();
const { query } = useBoardSearch();
</script>

<template>
  <pv-data-table :value="deliveries" :loading="loading" data-key="id" paginator :rows="10"
                 scrollable table-style="min-width: 48rem" class="wt-board-datatable">
    <template #empty>{{ query ? t('board-search.no-results', { query }) : t('deliveries.empty') }}</template>
    <pv-column :header="t('deliveries.table.id')" body-class="wt-board-id">
      <template #body="{ data }">#{{ data.id }}</template>
    </pv-column>
    <pv-column :header="t('deliveries.table.type')">
      <template #body="{ data }">
        <pv-tag :value="t(`deliveries.types.${data.type}`)" severity="secondary" />
      </template>
    </pv-column>
    <pv-column field="customerName" :header="t('deliveries.table.customer')" />
    <pv-column field="address" :header="t('deliveries.table.address')" />
    <pv-column :header="t('deliveries.table.driver')">
      <template #body="{ data }">{{ data.driverName || t('deliveries.unassigned') }}</template>
    </pv-column>
    <pv-column :header="t('deliveries.table.status')">
      <template #body="{ data }">
        <pv-tag :value="t(`deliveries.status.${data.status}`)" :severity="getStatusSeverity(data.status)" />
      </template>
    </pv-column>
    <pv-column :header="t('deliveries.table.date-time')">
      <template #body="{ data }">{{ formatDateTime(data.scheduledAt) }}</template>
    </pv-column>
  </pv-data-table>
</template>

<style scoped>

</style>