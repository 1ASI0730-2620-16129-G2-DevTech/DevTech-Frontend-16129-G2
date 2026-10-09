<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {computed, onMounted, toRefs} from "vue";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";
import useTrackingNotificationStore from "../../application/tracking-notification.store.js";
import {formatOrderCode} from "../tracking-helpers.js";
import TrackingList from "../components/tracking-list.vue";

const { t } = useI18n();
const router = useRouter();
const store = useTrackingNotificationStore();
const { trackings, trackingsLoaded, trackingsCount, errors } = toRefs(store);
const { fetchTrackings } = store;

const { query } = useBoardSearch();

onMounted(() => {
  if (!store.trackingsLoaded) {
    fetchTrackings();
  }
});

/** Trackings matching the header search by order code (e.g. "WT-001" or "1") or stage. */
const filteredTrackings = computed(() => searchItems(trackings.value, (tracking) => [
  formatOrderCode(tracking.orderId), tracking.orderId, t(`tracking.stages.${tracking.currentStage}`)
], query.value));

/**
 * Navigate to the tracking detail of an order.
 * @param {number} orderId - The ID of the order to track.
 */
const navigateToTracker = (orderId) => {
  router.push({ name: 'tracking-notifications-tracker', params: { orderId } });
};
</script>

<template>
  <section class="wt-board">
    <div class="wt-board-heading">
      <h1>{{ t('trackings.title') }} ({{ trackingsCount }})</h1>
    </div>
    <tracking-list :trackings="filteredTrackings" :loading="!trackingsLoaded" @view="navigateToTracker" />
    <div v-if="errors.length" class="wt-board-error mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </section>
</template>

<style scoped>

</style>