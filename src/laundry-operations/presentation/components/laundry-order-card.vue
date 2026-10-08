<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {Priority} from "@/laundry-operations/domain/model/priority.js";
import {nextStage} from "@/laundry-operations/domain/model/processing-stage.js";

const props = defineProps({
  order: {type: Object, required: true},
  cycle: {type: Object, default: null},
  resource: {type: Object, default: null}
});
const emit = defineEmits(['classify', 'assign', 'advance', 'prioritize']);

const {t} = useI18n();

const shortOrderId = computed(() => String(props.order.orderId ?? '').slice(0, 8));
const isReception = computed(() => props.order.currentStage === 'RECEPTION');
const isClassification = computed(() => props.order.currentStage === 'CLASSIFICATION');
const atRisk = computed(() => props.order.isAtDeliveryRisk());
</script>

<template>
  <pv-card class="mb-2">
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <span class="text-base">#{{ shortOrderId }}</span>
        <pv-tag v-if="order.isVip" :value="t('laundry-operations.priority.' + Priority.VIP)" severity="warn"/>
      </div>
    </template>
    <template #content>
      <div class="text-sm">
        <div v-if="order.expectedCompletion">
          {{ t('laundry-operations.card.expected') }}: {{ order.expectedCompletion.toLocaleString() }}
        </div>
        <div v-if="cycle">{{ t('laundry-operations.card.cycle') }}: {{ cycle.name }}</div>
        <div v-if="resource">{{ t('laundry-operations.card.resource') }}: {{ resource.name }}</div>
        <pv-tag v-if="atRisk" :value="t('laundry-operations.card.at-risk')" class="mt-2" severity="danger"/>
      </div>
      <div class="flex gap-1 mt-3">
        <pv-button v-if="isReception" :label="t('laundry-operations.card.classify')" size="small"
                   @click="emit('classify', order.id)"/>
        <pv-button v-if="isClassification" icon="pi pi-cog" size="small" severity="secondary"
                   :label="t('laundry-operations.card.assign')" @click="emit('assign', order.id)"/>
        <pv-button v-if="!isReception && !order.isReady" icon="pi pi-arrow-right" size="small"
                   :label="t('laundry-operations.card.advance')" @click="emit('advance', order.id, nextStage(order.currentStage))"/>
        <pv-button v-if="!order.isVip && !order.isReady" icon="pi pi-star" size="small" severity="warn" text rounded
                   @click="emit('prioritize', order.id)"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>

</style>
