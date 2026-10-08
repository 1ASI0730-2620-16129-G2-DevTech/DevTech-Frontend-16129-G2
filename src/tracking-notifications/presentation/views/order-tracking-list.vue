<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {computed, onMounted, ref, toRefs} from "vue";
import useTrackingNotificationStore from "../../application/tracking-notification.store.js";
import {formatOrderCode} from "../tracking-helpers.js";
import TrackingList from "../components/tracking-list.vue";

const { t } = useI18n();
const router = useRouter();
const store = useTrackingNotificationStore();
const { trackings, trackingsLoaded, trackingsCount, errors } = toRefs(store);
const { fetchTrackings } = store;

const search = ref('');

onMounted(() => {
  if (!store.trackingsLoaded) {
    fetchTrackings();
  }
});

/** Trackings whose order code matches the search text (e.g. "WT-001" or "1"). */
const filteredTrackings = computed(() => {
  const text = search.value.trim().toLowerCase().replace('#', '');
  if (!text) return trackings.value;
  return trackings.value.filter(tracking =>
      formatOrderCode(tracking.orderId).toLowerCase().replace('#', '').includes(text) ||
      String(tracking.orderId) === text);
});

/**
 * Navigate to the tracking detail of an order.
 * @param {number} orderId - The ID of the order to track.
 */
const navigateToTracker = (orderId) => {
  router.push({ name: 'tracking-notifications-tracker', params: { orderId } });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('trackings.title') }} ({{ trackingsCount }})</h1>
    <pv-icon-field class="mb-4">
      <pv-input-icon class="pi pi-search" />
      <pv-input-text v-model="search" :placeholder="t('trackings.search')" />
    </pv-icon-field>
    <tracking-list :trackings="filteredTrackings" :loading="!trackingsLoaded" @view="navigateToTracker" />
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>

</style>