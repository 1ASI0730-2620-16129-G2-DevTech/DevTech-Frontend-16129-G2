<script setup>
import {useI18n} from "vue-i18n";
import {onMounted, toRefs} from "vue";
import usePickupsDeliveriesStore from "../../application/pickups-deliveries.store.js";
import DeliveryCatalog from "../components/delivery-catalog.vue";

const { t } = useI18n();
const store = usePickupsDeliveriesStore();
const { deliveries, deliveriesLoaded, deliveriesCount, errors } = toRefs(store);
const { fetchDeliveries } = store;

onMounted(() => {
  if (!store.deliveriesLoaded) {
    fetchDeliveries();
  }
});
</script>

<template>
  <div class="p-4">
    <h1>{{ t('deliveries.catalog-title', { count: deliveriesCount }) }}</h1>
    <delivery-catalog :deliveries="deliveries" :loading="!deliveriesLoaded" />
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>

</style>