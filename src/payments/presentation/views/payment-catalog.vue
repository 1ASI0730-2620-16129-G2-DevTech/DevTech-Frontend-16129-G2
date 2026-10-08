<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {usePaymentsStore} from "../../application/payments.store.js";
import {PaymentStatus} from "../../domain/model/payment-status.js";

const {t} = useI18n();
const store = usePaymentsStore();
const {payments, loading, errors, summary} = storeToRefs(store);
const search = ref("");
const selectedStatus = ref("all");
const selectedPayment = ref(null);

const statusFilters = [
    {key: "all", label: "payments.filters.all"},
    {key: PaymentStatus.PAID, label: "payments.filters.paid"},
    {key: PaymentStatus.PENDING, label: "payments.filters.pending"},
    {key: PaymentStatus.CANCELLED, label: "payments.filters.cancelled"}
];

const filteredPayments = computed(() => {
    const query = search.value.trim().toLowerCase();
    return payments.value.filter((payment) => {
        const matchesStatus = selectedStatus.value === "all" || payment.status === selectedStatus.value;
        const matchesSearch = !query || [payment.customerName, payment.orderId, payment.id]
            .some((value) => String(value).toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
    });
});

function statusLabel(status) { return t(`payments.status.${status}`); }
function formatMethod(method) { return method.charAt(0).toUpperCase() + method.slice(1); }
function formatDate(date) {
    return new Intl.DateTimeFormat("es-PE", {day: "2-digit", month: "2-digit", year: "numeric"}).format(date);
}
function formatAmount(amount) {
    return new Intl.NumberFormat("es-PE", {style: "currency", currency: "PEN"}).format(amount);
}
function paymentCode(payment) {
  return `#PG${String(payment.id).padStart(3, "0")}`;
}
function openDetails(payment) {
  selectedPayment.value = payment;
}
onMounted(() => store.fetchPayments());
</script>

<template>
  <section class="payment-page">
    <template v-if="!selectedPayment">
    <div class="catalog-heading">
      <h1>{{ t('payments.catalog-title', {count: payments.length}) }}</h1>
    </div>

    <div class="catalog-panel">
      <div v-if="loading" class="empty-state">{{ t('payments.loading') }}</div>
      <div v-else-if="errors.length" class="empty-state error-state">{{ t('payments.error') }}</div>
      <div v-else-if="!filteredPayments.length" class="empty-state">{{ t('payments.empty') }}</div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('payments.columns.id') }}</th><th>{{ t('payments.columns.order') }}</th>
              <th>{{ t('payments.columns.customer') }}</th><th>{{ t('payments.columns.amount') }}</th>
              <th>{{ t('payments.columns.method') }}</th><th>{{ t('payments.columns.status') }}</th>
              <th>{{ t('payments.columns.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id" class="payment-row"
                tabindex="0" @dblclick="openDetails(payment)" @keydown.enter="openDetails(payment)">
              <td class="payment-id">{{ paymentCode(payment) }}</td>
              <td>#{{ String(payment.orderId).padStart(4, '0') }}</td>
              <td class="customer-name">{{ payment.customerName }}</td>
              <td>{{ formatAmount(payment.amount) }}</td><td>{{ formatMethod(payment.paymentMethod) }}</td>
              <td><span class="status" :class="`status-${payment.status}`">{{ statusLabel(payment.status) }}</span></td>
              <td>{{ formatDate(payment.orderDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
              <div><dt>{{ t('payments.columns.order') }}</dt><dd>#{{ String(selectedPayment.orderId).padStart(4, '0') }}</dd></div>
              <div><dt>{{ t('payments.columns.customer') }}</dt><dd>{{ selectedPayment.customerName }}</dd></div>
              <div><dt>{{ t('payments.columns.method') }}</dt><dd>{{ formatMethod(selectedPayment.paymentMethod) }}</dd></div>
              <div><dt>{{ t('payments.columns.date') }}</dt><dd>{{ formatDate(selectedPayment.orderDate) }}</dd></div>
              <div><dt>{{ t('payments.columns.status') }}</dt><dd>{{ statusLabel(selectedPayment.status) }}</dd></div>
              <div><dt>{{ t('payments.columns.amount') }}</dt><dd>{{ formatAmount(selectedPayment.amount) }}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.payment-page { max-width: 60rem; margin: 0; padding: 1.5rem 2rem 3rem; color: #123b7a; }
.catalog-heading { display: flex; align-items: center; gap: 1rem; margin-bottom: .7rem; }
h1 { font-size: 1rem; font-weight: 700; } h2 { font-size: .9rem; font-weight: 700; }
.period-filters { display: flex; align-items: center; gap: .35rem; }
.period-filters button { border: 0; border-radius: 1rem; padding: .3rem .7rem; background: #f5f9fd; color: #72819b; font-size: .68rem; cursor: pointer; }
.period-filters button.selected { background: #087fea; color: #fff; }
.catalog-panel { overflow: hidden; background: #fff; }
.table-wrapper { overflow-x: auto; } table { width: 100%; min-width: 48rem; border-collapse: collapse; font-size: .72rem; }
th { padding: .55rem .85rem; background: #f3f8fd; color: #71809a; font-size: .63rem; font-weight: 700; text-align: left; }
td { padding: .52rem .85rem; border-top: 1px solid #dce9f5; white-space: nowrap; } .payment-id, .customer-name { font-weight: 600; color: #123b7a; }
.payment-row { cursor: pointer; } .payment-row:hover, .payment-row:focus { background: #f8fbff; outline: none; }
.status { font-size: .72rem; } .status-paid { color: #1aaf5d; } .status-pending { color: #d97706; } .status-cancelled { color: #9b9b9b; }
.empty-state { padding: 3rem 1rem; color: #6b7d9f; text-align: center; } .error-state { color: #c03939; }
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
@media (max-width: 700px) { .payment-page { padding: 1rem; } .chart-heading { align-items: flex-start; flex-direction: column; } .garment-chart { margin-top: 2.5rem; } .detail-layout { grid-template-columns: 1fr; } .detail-layout .qr-frame { max-width: 20rem; } }
</style>