<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useOrderStore} from "../../application/order-store.js";
import {usePaymentsStore} from "@/payments/application/payments.store.js";
import {ORDER_STATUS_SEQUENCE, OrderStatus} from "../../domain/model/order-status.js";
import {CURRENT_LAUNDRY_ID} from "../current-laundry.js";
import OrderCreateDialog from "../components/order-create-dialog.vue";
import {mergeSort} from "@/shared/domain/model/merge-sort.js";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";

const {t} = useI18n();
const orderStore = useOrderStore();
const paymentsStore = usePaymentsStore();
const {orders, customers, loading, errors} = storeToRefs(orderStore);
const {payments} = storeToRefs(paymentsStore);

const selectedOrderId = ref(null);
const dialogVisible = ref(false);
const saving = ref(false);
const saveError = ref("");

const customerNames = computed(() =>
    new Map(customers.value.map((customer) => [customer.id, customer.fullName])));
const paymentsByOrder = computed(() =>
    new Map(payments.value.map((payment) => [String(payment.orderId), payment])));
const sortedOrders = computed(() =>
    mergeSort(orders.value, (a, b) => b.createdAt - a.createdAt));
const {query} = useBoardSearch();
const visibleOrders = computed(() => searchItems(sortedOrders.value, (order) => [
  orderCode(order), customerName(order), t(`orders.service.${order.serviceType}`),
  t(`orders.status.${order.status}`), paymentLabel(order), t(`orders.delivery.${order.deliveryMethod}`)
], query.value));
const selectedOrder = computed(() =>
    orders.value.find((order) => order.id === selectedOrderId.value) ?? null);

function nextStatus(order) {
  return ORDER_STATUS_SEQUENCE[ORDER_STATUS_SEQUENCE.indexOf(order.status) + 1] ?? null;
}
function canAdvance(order) {
  if (!nextStatus(order)) return false;
  return !(order.status === OrderStatus.CREATED && order.items.length === 0);
}
/** Badge color of each order status (same badge design on every board). */
const STATUS_SEVERITY = {
  [OrderStatus.CREATED]: "secondary",
  [OrderStatus.RECEIVED]: "contrast",
  [OrderStatus.CLASSIFIED]: "warn",
  [OrderStatus.IN_PROCESS]: "info",
  [OrderStatus.READY]: "success",
  [OrderStatus.DELIVERED]: "success"
};
function statusSeverity(status) { return STATUS_SEVERITY[status] ?? "secondary"; }
function orderCode(order) { return `#${order.id.slice(0, 6).toUpperCase()}`; }
function customerName(order) { return customerNames.value.get(order.customerId) ?? "—"; }
function paymentLabel(order) {
  const payment = paymentsByOrder.value.get(order.id);
  return payment ? t(`payments.status.${payment.status}`) : "—";
}
function formatDate(date) {
  return new Intl.DateTimeFormat("es-PE", {day: "2-digit", month: "short"}).format(date)
      .replace(".", "").replace(/^(\d+) (\w)/, (_, day, letter) => `${day} ${letter.toUpperCase()}`);
}

async function advance(order) {
  await orderStore.changeOrderStatus(order.id, nextStatus(order));
}

function openCreateDialog() {
  saveError.value = "";
  dialogVisible.value = true;
}

/**
 * Registers the order in Order Management and then its payment in Payments.
 * Each bounded context validates its own data through its domain model.
 */
async function createOrder(form) {
  saving.value = true;
  saveError.value = "";
  const order = await orderStore.placeOrder({
    customerId: form.customer.id,
    laundryId: CURRENT_LAUNDRY_ID,
    deliveryMethod: form.deliveryMethod,
    serviceType: form.serviceType,
    receptionDate: form.receptionDate,
    estimatedDeliveryDate: form.estimatedDeliveryDate,
    status: form.status,
    items: [{type: t("orders.form.default-garment"), quantity: form.garmentCount}]
  });
  if (!order) {
    saveError.value = errors.value[0]?.message ?? t("orders.error");
    saving.value = false;
    return;
  }
  const payment = await paymentsStore.createPayment({
    orderId: order.id,
    customerId: form.customer.id,
    customerName: form.customer.fullName,
    paymentMethod: form.paymentMethod,
    status: form.paymentStatus,
    orderDate: order.createdAt
  });
  saving.value = false;
  if (!payment) {
    saveError.value = t("orders.form.payment-error");
    return;
  }
  dialogVisible.value = false;
  selectedOrderId.value = order.id;
}

onMounted(() => {
  orderStore.fetchCustomers();
  orderStore.fetchAllOrders();
  paymentsStore.fetchPayments();
});
</script>

<template>
  <section class="order-page">
    <div class="catalog-heading">
      <h1>{{ t('orders.catalog-title', {count: orders.length}) }}</h1>
      <pv-button :label="t('orders.new')" icon="pi pi-plus" class="new-order-button" @click="openCreateDialog"/>
    </div>

    <div v-if="errors.length && !dialogVisible" class="error-banner">{{ t('orders.error') }}: {{ errors[0].message }}</div>

    <div class="catalog-panel">
      <div v-if="loading && !orders.length" class="empty-state">{{ t('orders.loading') }}</div>
      <div v-else-if="!orders.length" class="empty-state">{{ t('orders.empty') }}</div>
      <div v-else-if="!visibleOrders.length" class="empty-state">{{ t('board-search.no-results', {query}) }}</div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('orders.columns.id') }}</th>
              <th>{{ t('orders.columns.customer') }}</th>
              <th>{{ t('orders.columns.reception') }}</th>
              <th>{{ t('orders.columns.estimated-delivery') }}</th>
              <th>{{ t('orders.columns.garments') }}</th>
              <th>{{ t('orders.columns.service') }}</th>
              <th>{{ t('orders.columns.status') }}</th>
              <th>{{ t('orders.columns.payment') }}</th>
              <th>{{ t('orders.columns.delivery') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in visibleOrders" :key="order.id" class="order-row"
                :class="{selected: order.id === selectedOrderId}" tabindex="0"
                @click="selectedOrderId = order.id" @keydown.enter="selectedOrderId = order.id">
              <td class="order-id">{{ orderCode(order) }}</td>
              <td>{{ customerName(order) }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ formatDate(order.estimatedDeliveryDate) }}</td>
              <td>{{ order.garmentCount }}</td>
              <td>{{ t(`orders.service.${order.serviceType}`) }}</td>
              <td>
                <pv-tag :value="t(`orders.status.${order.status}`)" :severity="statusSeverity(order.status)"/>
              </td>
              <td>{{ paymentLabel(order) }}</td>
              <td>{{ t(`orders.delivery.${order.deliveryMethod}`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section v-if="selectedOrder" class="order-detail">
      <div class="detail-heading">
        <h2>{{ t('orders.detail.title', {code: orderCode(selectedOrder)}) }}</h2>
        <pv-button v-if="nextStatus(selectedOrder)" size="small" :disabled="!canAdvance(selectedOrder) || loading"
                   :label="t('orders.advance', {status: t(`orders.status.${nextStatus(selectedOrder)}`)})"
                   @click="advance(selectedOrder)"/>
      </div>
      <p v-if="!selectedOrder.items.length" class="empty-state">{{ t('orders.detail.no-items') }}</p>
      <table v-else>
        <thead>
          <tr>
            <th>{{ t('orders.detail.garment') }}</th><th>{{ t('orders.detail.quantity') }}</th>
            <th>{{ t('orders.detail.care') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedOrder.items" :key="item.id">
            <td>{{ item.type }}</td><td>{{ item.quantity }}</td><td>{{ item.careInstructions || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <order-create-dialog v-model:visible="dialogVisible" :customers="customers" :saving="saving"
                         :error-message="saveError" @save="createOrder"/>
  </section>
</template>

<style scoped>
.order-page { padding: 1.5rem 2rem 3rem; color: #123b7a; }
.catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
h1 { margin: 0; font-size: 1.05rem; font-weight: 700; }
h2 { margin: 0; font-size: .9rem; font-weight: 700; }
.new-order-button { border-radius: .5rem; font-size: .8rem; font-weight: 600; }
.error-banner { margin-bottom: .7rem; padding: .6rem .8rem; border-radius: .5rem; background: #fdecec; color: #b42318; font-size: .75rem; }
.catalog-panel, .order-detail { overflow: hidden; background: #fff; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 56rem; border-collapse: collapse; font-size: .75rem; }
thead tr { background: #f5f9fd; }
th { padding: 1.1rem 1.25rem; text-align: left; color: #72819b; font-size: .66rem; font-weight: 600;
  letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; }
td { padding: 1.1rem 1.25rem; border-bottom: 1px solid #e8eef6; color: #1b2f55; white-space: nowrap; }
.order-row { cursor: pointer; }
.order-row:hover, .order-row.selected { background: #f8fbfe; }
.order-id { font-weight: 700; color: #123b7a; }
.order-detail { margin-top: 1.5rem; padding: 1rem 1.25rem; }
.order-detail table { min-width: 0; }
.order-detail th, .order-detail td { padding: .7rem 1rem; }
.detail-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .8rem; }
.empty-state { padding: 1.5rem; text-align: center; color: #72819b; font-size: .75rem; }
</style>
