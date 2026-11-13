<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useLaundryOperationStore from "@/laundry-operations/application/laundry-operations.store.js";
import useResourceStore from "@/laundry-operations/application/resource.store.js";
import {PROCESSING_STAGES} from "@/laundry-operations/domain/model/processing-stage.js";
import LaundryOrderCard from "@/laundry-operations/presentation/components/laundry-order-card.vue";
import AssignOrderDialog from "@/laundry-operations/presentation/components/assign-order-dialog.vue";
import {useOrderStore} from "@/order-management/application/order-store.js";
import {OrderStatus} from "@/order-management/domain/model/order-status.js";
import {toOrderCode} from "@/shared/presentation/order-code.js";

const {t} = useI18n();
const operationStore = useLaundryOperationStore();
const resourceStore = useResourceStore();
const orderStore = useOrderStore();
const {laundryOrders, ordersByStage, washingCycles, errors: operationErrors} = storeToRefs(operationStore);
const {laundryResources, errors: resourceErrors} = storeToRefs(resourceStore);
const {orders, customers} = storeToRefs(orderStore);

const errors = computed(() => [...operationErrors.value, ...resourceErrors.value]);

const assignDialogVisible = ref(false);
const assigningOrderId = ref(null);
const selectableResources = ref([]);
const receiveDialogVisible = ref(false);
const selectedOrderId = ref(null);

// Orders and customers come from Order Management, so cards and the receive dialog show who each order belongs to.
const customerNames = computed(() => new Map(customers.value.map(customer => [customer.id, customer.fullName])));
const ordersById = computed(() => new Map(orders.value.map(order => [order.id, order])));
const customerNameOf = (orderId) => customerNames.value.get(ordersById.value.get(orderId)?.customerId) ?? null;

/** Orders that exist in Order Management, are not delivered and have no laundry order yet (newest first). */
const pendingOrderOptions = computed(() => {
  const receivedIds = new Set(laundryOrders.value.map(order => order.orderId));
  return orders.value
      .filter(order => order.status !== OrderStatus.DELIVERED && !receivedIds.has(order.id))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(order => ({
        value: order.id,
        label: `${toOrderCode(order.id)} · ${customerNameOf(order.id) ?? '—'}`
      }));
});

const assigningOrder = computed(() => operationStore.getLaundryOrderById(assigningOrderId.value) ?? null);

// Until the laundry of the logged-in user is available (IAM), the laundry is taken from the loaded resources.
const laundryId = computed(() => laundryResources.value[0]?.laundryId ?? null);

/** displayOrders(): loads what the dashboard shows. */
const displayOrders = () => {
  if (!operationStore.laundryOrdersLoaded) operationStore.fetchLaundryOrders();
  if (!operationStore.washingCyclesLoaded) operationStore.fetchWashingCycles();
  if (!resourceStore.laundryResourcesLoaded) resourceStore.fetchLaundryResources();
  orderStore.fetchAllOrders();
  orderStore.fetchCustomers();
};

onMounted(displayOrders);

/** updateStage(orderId, stage) */
const updateStage = (orderId, stage) => operationStore.advanceStage(orderId, stage);

/** prioritizeOrder(orderId) */
const prioritizeOrder = (orderId) => operationStore.prioritizeOrder(orderId);

const classifyOrder = (orderId) => operationStore.classifyOrder(orderId);

/** Opens the assignment dialog with the resources that the sensors report as available (plus the current one). */
const openAssign = async (orderId) => {
  assigningOrderId.value = orderId;
  const available = await resourceStore.getAvailableResources(laundryId.value);
  const current = laundryResources.value.find(r => r.id === assigningOrder.value?.resourceId);
  selectableResources.value = current ? [current, ...available] : available;
  assignDialogVisible.value = true;
};

const confirmAssign = async ({orderId, cycleId, resourceId}) => {
  if (await operationStore.assignWashingCycle(orderId, cycleId)) {
    await operationStore.assignResource(orderId, resourceId);
  }
};

/** Opens the receive dialog with the latest orders of Order Management. */
const openReceive = () => {
  selectedOrderId.value = null;
  orderStore.fetchAllOrders();
  receiveDialogVisible.value = true;
};

/** Receives the selected order, carrying over its estimated delivery date. */
const receiveOrder = async () => {
  const order = ordersById.value.get(selectedOrderId.value);
  if (!order) return;
  if (await operationStore.receiveOrder(order.id, order.estimatedDeliveryDate)) {
    selectedOrderId.value = null;
    receiveDialogVisible.value = false;
  }
};

const clearErrors = () => {
  operationStore.clearErrors();
  resourceStore.clearErrors();
};
</script>

<template>
  <div>
    <div class="flex justify-content-end mb-3">
      <pv-button :label="t('laundry-operations.board.receive')" icon="pi pi-plus" @click="openReceive"/>
    </div>

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
            :customer-name="customerNameOf(order.orderId)"
            :cycle="operationStore.getWashingCycleById(order.washingCycleId) ?? null"
            :resource="resourceStore.getLaundryResourceById(order.resourceId) ?? null"
            @classify="classifyOrder"
            @assign="openAssign"
            @advance="updateStage"
            @prioritize="prioritizeOrder"/>
      </section>
    </div>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
      <pv-button :label="t('laundry-operations.board.dismiss')" text size="small" @click="clearErrors"/>
    </div>

    <assign-order-dialog v-model:visible="assignDialogVisible" :order="assigningOrder" :cycles="washingCycles"
                         :resources="selectableResources" @confirm="confirmAssign"/>

    <pv-dialog v-model:visible="receiveDialogVisible" modal :header="t('laundry-operations.board.receive')"
               :style="{width: '26rem'}">
      <div class="field mb-3">
        <label for="order-id">{{ t('laundry-operations.board.order-id') }}</label>
        <pv-select v-model="selectedOrderId" input-id="order-id" :options="pendingOrderOptions"
                   option-label="label" option-value="value" filter class="w-full"
                   :placeholder="t('laundry-operations.board.select-order')"
                   :empty-message="t('laundry-operations.board.no-pending-orders')"/>
      </div>
      <template #footer>
        <pv-button :label="t('laundry-operations.common.cancel')" severity="secondary" outlined
                   @click="receiveDialogVisible = false"/>
        <pv-button :label="t('laundry-operations.common.save')" icon="pi pi-check" :disabled="!selectedOrderId"
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
