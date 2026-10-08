<script setup>
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {computed, watch} from "vue";
import useTrackingNotificationStore from "../../application/tracking-notification.store.js";
import {formatOrderCode} from "../tracking-helpers.js";
import StageStepper from "../components/stage-stepper.vue";
import TrackingSummary from "../components/tracking-summary.vue";
import TrackingHistory from "../components/tracking-history.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTrackingNotificationStore();
const { fetchTracking } = store;

const orderId = computed(() => Number(route.params.orderId));

watch(orderId, (id) => fetchTracking(id), { immediate: true });

/** The tracking of this order (ignores a stale tracking of another order). */
const tracking = computed(() => {
  return store.currentTracking?.orderId === orderId.value ? store.currentTracking : null;
});

const navigateBack = () => {
  router.push({ name: 'tracking-notifications-trackings' });
};
</script>

<template>
  <div class="p-4">
    <div class="flex align-items-center gap-2 mb-3">
      <pv-button icon="pi pi-arrow-left" text rounded @click="navigateBack" />
      <h1 class="m-0">{{ t('tracker.title', { code: formatOrderCode(orderId) }) }}</h1>
    </div>

    <p v-if="!tracking">{{ t('tracker.not-found') }}</p>

    <div v-else class="grid">
      <div class="col-12 lg:col-7">
        <section class="tracker-card">
          <h2>{{ t('tracker.progress') }}</h2>
          <stage-stepper :current-stage="tracking.currentStage" />
        </section>
        <section class="tracker-card mt-3">
          <h2>{{ t('tracker.history') }}</h2>
          <tracking-history :history="tracking.history" />
        </section>
      </div>
      <div class="col-12 lg:col-5">
        <section class="tracker-card">
          <h2>{{ t('tracker.details') }}</h2>
          <tracking-summary :tracking="tracking" />
        </section>
      </div>
    </div>

    <div v-if="store.errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ store.errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.tracker-card {
  border: 1px solid #1a2f5a;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
}

.tracker-card h2 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #1a2f5a;
}
</style>