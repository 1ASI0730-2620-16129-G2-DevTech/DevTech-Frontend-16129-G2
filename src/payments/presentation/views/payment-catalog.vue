<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {usePaymentsStore} from "../../application/payments.store.js";
import {PaymentStatus} from "../../domain/model/payment-status.js";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";

const {t} = useI18n();
const store = usePaymentsStore();
const {payments, loading, errors, summary} = storeToRefs(store);
const {query} = useBoardSearch();
const selectedStatus = ref("all");
const selectedPayment = ref(null);

const statusFilters = [
    {key: "all", label: "payments.filters.all"},
    {key: PaymentStatus.PAID, label: "payments.filters.paid"},
    {key: PaymentStatus.PENDING, label: "payments.filters.pending"},
    {key: PaymentStatus.CANCELLED, label: "payments.filters.cancelled"}
];

const filteredPayments = computed(() => {
    const byStatus = payments.value.filter((payment) =>
        selectedStatus.value === "all" || payment.status === selectedStatus.value);
    return searchItems(byStatus, (payment) => [
        paymentCode(payment), payment.customerName, orderCode(payment.orderId), payment.orderId,
        formatMethod(payment.paymentMethod), statusLabel(payment.status)
    ], query.value);
});

function statusLabel(status) { return t(`payments.status.${status}`); }
const STATUS_SEVERITY = {
    [PaymentStatus.PAID]: "success",
    [PaymentStatus.PENDING]: "warn",
    [PaymentStatus.CANCELLED]: "danger"
};
function statusSeverity(status) { return STATUS_SEVERITY[status] ?? "secondary"; }
function formatMethod(method) { return method.charAt(0).toUpperCase() + method.slice(1); }
function formatDate(date) {
    return new Intl.DateTimeFormat("es-PE", {day: "2-digit", month: "2-digit", year: "numeric"}).format(date);
}
function formatAmount(amount) {
    return new Intl.NumberFormat("es-PE", {style: "currency", currency: "PEN"}).format(amount);
}
function paymentCode(payment) {
  return `#${payment.id}`;
}
function orderCode(orderId) {
  const id = String(orderId);
  return /^d+$/.test(id) ? `#${id.padStart(4, "0")}` : `#${id.slice(0, 6).toUpperCase()}`;
}
function openDetails(payment) {
  selectedPayment.value = payment;
}
onMounted(() => store.fetchPayments());
</script>

<template>
  <section class="wt-board payment-page">
    <template v-if="!selectedPayment">
    <div class="wt-board-heading">
      <h1>{{ t('payments.catalog-title', {count: payments.length}) }}</h1>
    </div>

    <div class="wt-board-panel">
      <div v-if="loading" class="wt-board-empty">{{ t('payments.loading') }}</div>
      <div v-else-if="errors.length" class="wt-board-empty error-state">{{ t('payments.error') }}</div>
      <div v-else-if="!payments.length" class="wt-board-empty">{{ t('payments.empty') }}</div>
      <div v-else-if="!filteredPayments.length" class="wt-board-empty">{{ t('board-search.no-results', {query}) }}</div>
      <table v-else class="wt-board-table">
        <thead>
          <tr>
            <th>{{ t('payments.columns.id') }}</th><th>{{ t('payments.columns.order') }}</th>
            <th>{{ t('payments.columns.customer') }}</th><th>{{ t('payments.columns.amount') }}</th>
            <th>{{ t('payments.columns.method') }}</th><th>{{ t('payments.columns.status') }}</th>
            <th>{{ t('payments.columns.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment.id" class="wt-clickable"
              tabindex="0" @dblclick="openDetails(payment)" @keydown.enter="openDetails(payment)">
            <td class="wt-board-id">{{ paymentCode(payment) }}</td>
            <td>{{ orderCode(payment.orderId) }}</td>
            <td class="customer-name">{{ payment.customerName }}</td>
            <td>{{ formatAmount(payment.amount) }}</td><td>{{ formatMethod(payment.paymentMethod) }}</td>
            <td><pv-tag :value="statusLabel(payment.status)" :severity="statusSeverity(payment.status)"/></td>
            <td>{{ formatDate(payment.orderDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="garment-chart">
      <div class="chart-heading">
        <h2>{{ t('payments.chart-title') }}</h2>
        <div class="period-filters">
          <button type="button">{{ t('payments.periods.hour') }}</button>
          <button type="button" class="selected">{{ t('payments.periods.day') }}</button>
          <button type="button">{{ t('payments.periods.week') }}</button>
          <button type="button">{{ t('payments.periods.month') }}</button>
        </div>
      </div>
      <div class="chart-area" aria-hidden="true">
        <svg viewBox="0 0 880 150" preserveAspectRatio="none">
          <polyline points="15,112 70,96 126,120 182,78 240,86 300,52 357,70 416,34 472,62 530,43 588,78 646,53 704,88 762,61 824,92 866,66" />
        </svg>
      </div>
    </section>
    </template>

    <section v-else class="payment-detail-page">
      <div class="detail-breadcrumb">
        <button type="button" class="back-button" @click="selectedPayment = null">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          {{ t('payments.detail.back') }}
        </button>
        <span>{{ t('payments.detail.title') }}</span>
      </div>
      <div class="detail-layout">
        <div class="qr-frame" aria-label="Código QR de Yape">
          <img class="yape-qr" src="/yape-qr.png" alt="Código QR de Yape" />
        </div>
        <div class="detail-side">
          <div class="payment-person">
            <span class="person-avatar"></span>
            <div>
              <strong>{{ selectedPayment.customerName }}</strong>
              <small>{{ t(`payments.status.${selectedPayment.status}`) }}</small>
            </div>
            <span class="phone-icon pi pi-phone"></span>
          </div>
          <div class="detail-card">
            <h2>{{ t('payments.detail.title') }}</h2>
            <dl>
              <div><dt>{{ t('payments.columns.id') }}</dt><dd>{{ paymentCode(selectedPayment) }}</dd></div>
              <div><dt>{{ t('payments.columns.order') }}</dt><dd>{{ orderCode(selectedPayment.orderId) }}</dd></div>
              <div><dt>{{ t('payments.columns.customer') }}</dt><dd>{{ selectedPayment.customerName }}</dd></div>
              <div><dt>{{ t('payments.columns.method') }}</dt><dd>{{ formatMethod(selectedPayment.paymentMethod) }}</dd></div>
              <div><dt>{{ t('payments.columns.date') }}</dt><dd>{{ formatDate(selectedPayment.orderDate) }}</dd></div>
              <div><dt>{{ t('payments.columns.status') }}</dt><dd><pv-tag :value="statusLabel(selectedPayment.status)" :severity="statusSeverity(selectedPayment.status)"/></dd></div>
              <div><dt>{{ t('payments.columns.amount') }}</dt><dd>{{ formatAmount(selectedPayment.amount) }}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
h2 { font-size: .9rem; font-weight: 700; }
.period-filters { display: flex; align-items: center; gap: .35rem; }
.period-filters button { border: 0; border-radius: 1rem; padding: .3rem .7rem; background: #f5f9fd; color: #72819b; font-size: .68rem; cursor: pointer; }
.period-filters button.selected { background: #087fea; color: #fff; }
.customer-name { font-weight: 600; color: #123b7a; }
.error-state { color: #c03939; }
.payment-details { color: #123b7a; }
.payment-detail-page { min-height: 29rem; }
.detail-breadcrumb { display: flex; align-items: center; gap: .45rem; margin-bottom: 1.5rem; color: #71809a; font-size: .68rem; }
.back-button { border: 0; padding: 0; background: transparent; color: #087fea; font-size: .68rem; cursor: pointer; }
.detail-layout { display: grid; grid-template-columns: minmax(18rem, 1fr) 19rem; align-items: start; gap: 2rem 2.5rem; }
.qr-frame { display: flex; justify-content: center; padding: .25rem 0 1.25rem; }
.yape-qr { display: block; width: min(20rem, 100%); height: auto; }
.detail-side { display: flex; flex-direction: column; gap: 2rem; }
.payment-person { display: flex; align-items: center; gap: .7rem; padding: .7rem; border: 1px solid #bfc6ce; border-radius: 10px; }
.person-avatar { width: 1.9rem; height: 1.9rem; flex: 0 0 auto; border-radius: 50%; background: #123b7a; }
.payment-person div { display: flex; flex: 1; flex-direction: column; font-size: .78rem; } .payment-person small { color: #d97706; }
.phone-icon { color: #123b7a; font-size: 1rem; }
.detail-card { padding: .8rem; border: 1px solid #bfc6ce; border-radius: 10px; }
.detail-card h2 { margin: 0 0 .65rem; font-size: .86rem; }
.detail-card dl { margin: 0; font-size: .72rem; } .detail-card dl div { display: flex; justify-content: space-between; gap: 1rem; padding: .32rem 0; border-top: 1px solid #dce9f5; }
.detail-card dt { font-weight: 600; } .detail-card dd { margin: 0; text-align: right; }
.garment-chart { margin-top: 3.7rem; }
.chart-heading { display: flex; align-items: center; justify-content: space-between; margin: 0 0 .65rem; }
.chart-area { height: 9.6rem; padding: 1rem .75rem; border-radius: 8px; background: #f4f9fd; }
.chart-area svg { width: 100%; height: 100%; overflow: visible; }
.chart-area polyline { fill: none; stroke: #f59b00; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
@media (max-width: 700px) { .chart-heading { align-items: flex-start; flex-direction: column; } .garment-chart { margin-top: 2.5rem; } .detail-layout { grid-template-columns: 1fr; } .detail-layout .qr-frame { max-width: 20rem; } }
</style>