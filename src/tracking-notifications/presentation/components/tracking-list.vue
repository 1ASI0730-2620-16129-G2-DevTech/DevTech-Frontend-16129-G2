<script setup>
import {useI18n} from "vue-i18n";
import {formatDateTime, formatOrderCode, ORDER_STAGES} from "../tracking-helpers.js";
import StageTag from "./stage-tag.vue";

defineProps({
  trackings: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['view']);

const { t } = useI18n();

/** Number of stages reached so far, used for the progress label (e.g. 3/6). */
function stagesReached(tracking) {
  return ORDER_STAGES.indexOf(tracking.currentStage) + 1;
}
</script>

<template>
  <div class="wt-board-panel">
    <div v-if="loading" class="wt-board-empty">{{ t('trackings.loading') }}</div>
    <div v-else-if="!trackings.length" class="wt-board-empty">{{ t('trackings.empty') }}</div>
    <table v-else class="wt-board-table">
      <thead>
        <tr>
          <th>{{ t('trackings.columns.order') }}</th>
          <th>{{ t('trackings.columns.stage') }}</th>
          <th>{{ t('trackings.columns.progress') }}</th>
          <th>{{ t('trackings.estimated-delivery') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tracking in trackings" :key="tracking.id" class="wt-clickable" tabindex="0"
            @click="emit('view', tracking.orderId)" @keydown.enter="emit('view', tracking.orderId)">
          <td class="wt-board-id">{{ formatOrderCode(tracking.orderId) }}</td>
          <td><stage-tag :stage="tracking.currentStage" /></td>
          <td>{{ t('tracking.progress', { done: stagesReached(tracking), total: ORDER_STAGES.length }) }}</td>
          <td>{{ formatDateTime(tracking.estimatedDelivery) }}</td>
          <td class="action">
            <pv-button :label="t('trackings.view')" icon="pi pi-eye" size="small" text
                       @click.stop="emit('view', tracking.orderId)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.action { text-align: right; }
</style>
