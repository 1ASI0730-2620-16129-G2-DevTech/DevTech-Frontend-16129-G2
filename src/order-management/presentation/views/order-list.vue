<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useOrderStore} from "../../application/order-store.js";
import {ORDER_STATUS_SEQUENCE, OrderStatus} from "../../domain/model/order-status.js";
import {demoCustomers, demoLaundries} from "../order-demo-customers.js";

const {t} = useI18n();
const store = useOrderStore();
const {orders, loading, errors} = storeToRefs(store);
const selectedCustomerId = ref(demoCustomers[0].id);
const selectedOrderId = ref(null);

const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => b.createdAt - a.createdAt));
const selectedOrder = computed(() =>
    orders.value.find((order) => order.id === selectedOrderId.value) ?? null);

function nextStatus(order) {
    return ORDER_STATUS_SEQUENCE[ORDER_STATUS_SEQUENCE.indexOf(order.status) + 1] ?? null;
}
function canAdvance(order) {
    if (!nextStatus(order)) return false;
    return !(order.status === OrderStatus.CREATED && order.items.length === 0);
}
function orderCode(order) { return `#${order.id.slice(0, 8).toUpperCase()}`; }
function laundryName(order) { return demoLaundries[order.laundryId] ?? order.laundryId.slice(0, 8); }
function garmentCount(order) { return order.items.reduce((total, item) => total + item.quantity, 0); }
function formatDate(date) {
    return new Intl.DateTimeFormat("es-PE", {day: "2-digit", month: "2-digit", year: "numeric"}).format(date);
}

async function loadOrders() {
    selectedOrderId.value = null;
    await store.fetchOrdersByCustomer(selectedCustomerId.value);
}
async function advance(order) {
    await store.changeOrderStatus(order.id, nextStatus(order));
}

onMounted(loadOrders);
</script>

<template>
  <section class="order-page">
    <div class="catalog-heading">
      <h1>{{ t('orders.catalog-title', {count: orders.length}) }}</h1>
      <label class="customer-select">
        <span>{{ t('orders.customer') }}</span>
        <select v-model="selectedCustomerId" @change="loadOrders">
          <option v-for="customer in demoCustomers" :key="customer.id" :value="customer.id">
            {{ customer.fullName }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="errors.length" class="error-banner">{{ t('orders.error') }}: {{ errors[0].message }}</div>

    <div class="catalog-panel">
      <div v-if="loading && !orders.length" class="empty-state">{{ t('orders.loading') }}</div>
      <div v-else-if="!orders.length" class="empty-state">{{ t('orders.empty') }}</div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('orders.columns.id') }}</th><th>{{ t('orders.columns.date') }}</th>
              <th>{{ t('orders.columns.laundry') }}</th><th>{{ t('orders.columns.delivery') }}</th>
              <th>{{ t('orders.columns.garments') }}</th><th>{{ t('orders.columns.status') }}</th>
              <th>{{ t('orders.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in sortedOrders" :key="order.id" class="order-row"
                :class="{selected: order.id === selectedOrderId}"
                tabindex="0" @click="selectedOrderId = order.id" @keydown.enter="selectedOrderId = order.id">
              <td class="order-id">{{ orderCode(order) }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ laundryName(order) }}</td>
              <td>{{ t(`orders.delivery.${order.deliveryMethod}`) }}</td>
              <td>{{ garmentCount(order) }}</td>
              <td><span class="status" :class="`status-${order.status}`">{{ t(`orders.status.${order.status}`) }}</span></td>
              <td>
                <button v-if="nextStatus(order)" type="button" class="advance-button"
                        :disabled="!canAdvance(order) || loading" @click.stop="advance(order)">
                  {{ t('orders.advance', {status: t(`orders.status.${nextStatus(order)}`)}) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section v-if="selectedOrder" class="order-detail">
      <h2>{{ t('orders.detail.title', {code: orderCode(selectedOrder)}) }}</h2>
      <p v-if="selectedOrder.specialCareInstructions" class="care-note">
        <i class="pi pi-info-circle" aria-hidden="true"></i> {{ selectedOrder.specialCareInstructions }}
      </p>
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
  </section>
</template>

<style scoped>
.order-page { max-width: 60rem; margin: 0; padding: 1.5rem 2rem 3rem; color: #123b7a; }
.catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .7rem; flex-wrap: wrap; }
h1 { font-size: 1rem; font-weight: 700; } h2 { font-size: .9rem; font-weight: 700; margin-bottom: .6rem; }
.customer-select { display: flex; align-items: center; gap: .5rem; font-size: .75rem; color: #72819b; }
.customer-select select { border: 1px solid #d6e2f0; border-radius: .5rem; padding: .35rem .6rem; color: #123b7a; background: #fff; font-size: .75rem; }
.error-banner { margin-bottom: .7rem; padding: .6rem .8rem; border-radius: .5rem; background: #fdecec; color: #b42318; font-size: .75rem; }
.catalog-panel, .order-detail { overflow: hidden; background: #fff; }
.order-detail { margin-top: 1.5rem; padding: 1rem; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 44rem; border-collapse: collapse; font-size: .72rem; }
.order-detail table { min-width: 0; }
th { padding: .7rem .6rem; text-align: left; color: #72819b; font-weight: 600; border-bottom: 1px solid #e8eef6; }
td { padding: .65rem .6rem; border-bottom: 1px solid #f0f4f9; }
.order-row { cursor: pointer; } .order-row:hover, .order-row.selected { background: #f5f9fd; }
.order-id { font-weight: 700; }
.status { display: inline-block; padding: .2rem .55rem; border-radius: 1rem; font-size: .66rem; font-weight: 600; background: #eef2f7; color: #4b5b76; }
.status-RECEIVED, .status-CLASSIFIED { background: #e6f1fd; color: #0b63c1; }
.status-IN_PROCESS { background: #fff4e0; color: #a35c00; }
.status-READY { background: #e7f8ee; color: #137a3f; }
.status-DELIVERED { background: #ece9fb; color: #5b3fc4; }
.advance-button { border: 0; border-radius: 1rem; padding: .3rem .7rem; background: #087fea; color: #fff; font-size: .66rem; cursor: pointer; white-space: nowrap; }
.advance-button:disabled { background: #c9d6e6; cursor: not-allowed; }
.empty-state { padding: 1.5rem; text-align: center; color: #72819b; font-size: .75rem; }
.care-note { margin-bottom: .6rem; font-size: .72rem; color: #4b5b76; }
</style>
