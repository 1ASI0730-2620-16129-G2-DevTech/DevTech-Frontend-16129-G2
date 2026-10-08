<script setup>
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {formatDateTime, formatOrderCode, ORDER_STAGES} from "../tracking-helpers.js";
import StageTag from "./stage-tag.vue";

const props = defineProps({
  tracking: { type: Object, required: true }
});

const emit = defineEmits(['view']);

const { t } = useI18n();

/** Number of stages reached so far, used for the progress label (e.g. 3/6). */
const stagesReached = computed(() => {
  return ORDER_STAGES.indexOf(props.tracking.currentStage) + 1;
});
</script>

<template>
  <div class="tracking-item">
    <div class="info">
      <strong class="code">{{ formatOrderCode(tracking.orderId) }}</strong>
      <stage-tag :stage="tracking.currentStage" />
      <span class="progress">{{ t('tracking.progress', { done: stagesReached, total: ORDER_STAGES.length }) }}</span>
    </div>
    <div class="delivery">
      <small>{{ t('trackings.estimated-delivery') }}</small>
      <span>{{ formatDateTime(tracking.estimatedDelivery) }}</span>
    </div>
    <pv-button :label="t('trackings.view')" icon="pi pi-eye" size="small" @click="emit('view', tracking.orderId)" />
  </div>
</template>

<style scoped>
.tracking-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e3e8f0;
  border-radius: 0.75rem;
}

.info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.code {
  color: #1a2f5a;
}

.progress {
  color: #6b7a99;
  font-size: 0.85rem;
}

.delivery {
  display: flex;
  flex-direction: column;
}

.delivery small {
  color: #6b7a99;
}
</style>