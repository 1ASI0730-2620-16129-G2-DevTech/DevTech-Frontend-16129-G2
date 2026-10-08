<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useLaundryOperationsStore from "@/laundry-operations/application/laundry-operations.store.js";
import {PROCESSING_STAGES} from "@/laundry-operations/domain/model/processing-stage.js";
import LaundryOperationsMenu from "@/laundry-operations/presentation/components/laundry-operations-menu.vue";
import LaundryOperationsSummary from "@/laundry-operations/presentation/components/laundry-operations-summary.vue";
import LaundryOrderCard from "@/laundry-operations/presentation/components/laundry-order-card.vue";
import AssignOrderDialog from "@/laundry-operations/presentation/components/assign-order-dialog.vue";

const {t} = useI18n();
const store = useLaundryOperationsStore();
const {ordersByStage, washingCycles, laundryResources, availableResources, errors} = storeToRefs(store);

const assignDialogVisible = ref(false);
const assigningOrderId = ref(null);
const receiveDialogVisible = ref(false);
const newOrderId = ref('');

const assigningOrder = computed(() => store.getLaundryOrderById(assigningOrderId.value) ?? null);

/** Resources the user can pick: the available ones plus the one already assigned to the order. */
const selectableResources = computed(() => {
  const current = laundryResources.value.find(r => r.id === assigningOrder.value?.resourceId);
  return current ? [current, ...availableResources.value] : availableResources.value;
});

onMounted(() => {
  if (!store.laundryOrdersLoaded) store.fetchLaundryOrders();
  if (!store.washingCyclesLoaded) store.fetchWashingCycles();
  if (!store.laundryResourcesLoaded) store.fetchLaundryResources();
});

const openAssign = (orderId) => {
  assigningOrderId.value = orderId;
  assignDialogVisible.value = true;
};

const confirmAssign = ({orderId, cycleId, resourceId}) => {
  store.assignCycleAndResource(orderId, cycleId, resourceId);
};

const receiveOrder = async () => {
  await store.receiveOrder(newOrderId.value.trim());
  newOrderId.value = '';
  receiveDialogVisible.value = false;
};
</script>

<template>
  <div>
    <div class="flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <laundry-operations-menu/>
      <pv-button :label="t('laundry-operations.board.receive')" icon="pi pi-plus" @click="receiveDialogVisible = true"/>
    </div>

    <laundry-operations-summary class="mb-4"/>

    <div class="flex gap-3 overflow-x-auto pb-2">
      <section v-for="stage in PROCESSING_STAGES" :key="stage" class="stage-column flex-shrink-0">
        <div class="flex align-items-center justify-content-between mb-3">
          <strong>{{ t('laundry-operations.stages.' + stage) }}</strong>
          <pv-tag :value="ordersByStage[stage].length" severity="secondary"/>
        </div>
        <laundry-order-card
            v-for="order in ordersByStage[stage]"
            :key="order.id"
            :order="order"
            :cycle="store.getWashingCycleById(order.washingCycleId) ?? null"
            :resource="store.getLaundryResourceById(order.resourceId) ?? null"
            @classify="store.classifyOrder"
            @assign="openAssign"
            @advance="store.advanceStage"
            @prioritize="store.prioritizeOrder"/>
      </section>
    </div>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
      <pv-button :label="t('laundry-operations.board.dismiss')" text size="small" @click="store.clearErrors()"/>
    </div>

    <assign-order-dialog v-model:visible="assignDialogVisible" :order="assigningOrder" :cycles="washingCycles"
                         :resources="selectableResources" @confirm="confirmAssign"/>

    <pv-dialog v-model:visible="receiveDialogVisible" modal :header="t('laundry-operations.board.receive')"
               :style="{width: '26rem'}">
      <div class="field mb-3">
        <label for="order-id">{{ t('laundry-operations.board.order-id') }}</label>
        <pv-input-text id="order-id" v-model="newOrderId" class="w-full"/>
      </div>
      <template #footer>
        <pv-button :label="t('laundry-operations.common.cancel')" severity="secondary" outlined
                   @click="receiveDialogVisible = false"/>
        <pv-button :label="t('laundry-operations.common.save')" icon="pi pi-check" :disabled="!newOrderId.trim()"
                   @click="receiveOrder"/>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.stage-column {
  width: 16rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--wt-surface);
}
</style>
