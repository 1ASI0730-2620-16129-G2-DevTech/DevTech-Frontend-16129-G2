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
  <section class="wt-board">
    <div class="flex align-items-center gap-2 mb-3">
      <pv-button icon="pi pi-arrow-left" text rounded :aria-label="t('tracker.back')" @click="navigateBack" />
      <h1 class="m-0 tracker-title">{{ t('tracker.title', { code: formatOrderCode(orderId) }) }}</h1>
    </div>

    <p v-if="!tracking">{{ t('tracker.not-found') }}</p>

    <div v-else class="tracker-layout">
      <figure class="tracker-map">
        <img src="/Seguimiento.png" :alt="t('tracker.map-alt')" />
      </figure>

      <div class="tracker-cards">
        <section class="tracker-card">
          <h2>{{ t('tracker.progress') }}</h2>
          <stage-stepper :current-stage="tracking.currentStage" />
        </section>
        <section class="tracker-card">
          <h2>{{ t('tracker.details') }}</h2>
          <tracking-summary :tracking="tracking" />
        </section>
        <section class="tracker-card">
          <h2>{{ t('tracker.history') }}</h2>
          <tracking-history :history="tracking.history" />
        </section>
      </div>
    </div>

    <div v-if="store.errors.length" class="wt-board-error mt-3">
      {{ t('errors.occurred') }}: {{ store.errors.map(e => e.message).join(', ') }}
    </div>
  </section>
</template>

<style scoped>
.tracker-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.tracker-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;
}

.tracker-cards {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

/* Cards as in the visual reference: white, dark thin border, very rounded. */
.tracker-card {
  padding: 1rem 1.25rem;
  border: 1px solid #1a2f5a;
  border-radius: 1.1rem;
  background: #fff;
}

.tracker-card h2 {
  margin: 0 0 .75rem;
  font-size: 1.05rem;
  color: #123b7a;
}

.tracker-map {
  position: sticky;
  top: 1rem;
  margin: 0;
}

.tracker-map img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 1rem;
}

@media (max-width: 960px) {
  .tracker-layout {
    grid-template-columns: 1fr;
  }

  .tracker-map {
    position: static;
  }
}
</style>
