<script setup>
import {useI18n} from "vue-i18n";
import {formatDateTime, formatOrderCode} from "../tracking-helpers.js";
import StageTag from "./stage-tag.vue";

defineProps({
  tracking: { type: Object, required: true }
});

const { t } = useI18n();
</script>

<template>
  <dl class="summary">
    <dt>{{ t('tracker.order') }}</dt>
    <dd>{{ formatOrderCode(tracking.orderId) }}</dd>
    <dt>{{ t('tracker.current-stage') }}</dt>
    <dd><stage-tag :stage="tracking.currentStage" /></dd>
    <dt>{{ t('tracker.estimated-delivery') }}</dt>
    <dd>{{ formatDateTime(tracking.estimatedDelivery) }}</dd>
  </dl>
</template>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.summary dt {
  font-weight: 600;
}

.summary dd {
  margin: 0;
  text-align: right;
  border-bottom: 1px solid #e3e8f0;
}
</style>