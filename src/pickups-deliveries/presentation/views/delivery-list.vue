<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, toRefs} from "vue";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";
import usePickupsDeliveriesStore from "../../application/pickups-deliveries.store.js";
import DeliveryCatalog from "../components/delivery-catalog.vue";

const { t } = useI18n();
const store = usePickupsDeliveriesStore();
const { deliveries, deliveriesLoaded, deliveriesCount, errors } = toRefs(store);
const { fetchDeliveries } = store;

const { query } = useBoardSearch();
const visibleDeliveries = computed(() => searchItems(deliveries.value, (delivery) => [
  `#${delivery.id}`, delivery.customerName, delivery.address, delivery.driverName,
  t(`deliveries.types.${delivery.type}`), t(`deliveries.status.${delivery.status}`)
], query.value));

onMounted(() => {
  if (!store.deliveriesLoaded) {
    fetchDeliveries();
  }
});
</script>

<template>
  <section class="wt-board">
    <div class="wt-board-heading">
      <h1>{{ t('deliveries.catalog-title', { count: deliveriesCount }) }}</h1>
    </div>
    <delivery-catalog :deliveries="visibleDeliveries" :loading="!deliveriesLoaded" />
    <div v-if="errors.length" class="wt-board-error mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </section>
</template>

<style scoped>

</style>