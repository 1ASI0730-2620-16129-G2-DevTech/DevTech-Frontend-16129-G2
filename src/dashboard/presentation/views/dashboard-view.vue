<script setup>
import {computed, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useDashboardStore} from "../../application/dashboard.store.js";
import {ordersPerDay, revenuePerDay, statusDistribution, summarize, topServices} from "../../domain/model/dashboard-metrics.js";
import {ORDER_STATUS_SEQUENCE} from "@/order-management/domain/model/order-status.js";
import useResourceStore from "@/laundry-operations/application/resource.store.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";
import BarChart from "../components/bar-chart.vue";
import LineChart from "../components/line-chart.vue";
import RankingBars from "../components/ranking-bars.vue";
import DonutChart from "../components/donut-chart.vue";

const {t} = useI18n();
const store = useDashboardStore();
const {orders, payments, customersCount, loading, errors} = storeToRefs(store);
const resourceStore = useResourceStore();
const {laundryResources} = storeToRefs(resourceStore);

// Categorical slots 1-6 of the validated palette, one per order status in their fixed order.
const STATUS_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];

// Machine monitoring comes from the IoT context, which is not connected yet: the cards stay blank.
const MACHINE_STATES = [
  {key: "normal", color: "#1aaf5d"},
  {key: "warning", color: "#eda100"},
  {key: "review", color: "#eb6834"},
  {key: "offline", color: "#72819b"}
];

const money = (amount) => new Intl.NumberFormat("es-PE", {style: "currency", currency: "PEN"}).format(amount);
const dayLabel = (date) => new Intl.DateTimeFormat("es-PE", {day: "2-digit", month: "short"}).format(date).replace(".", "");

const summary = computed(() => summarize({orders: orders.value, payments: payments.value, customersCount: customersCount.value}));
const kpis = computed(() => [
  {key: "orders", value: summary.value.orders},
  {key: "in-process", value: summary.value.inProcess},
  {key: "ready", value: summary.value.ready},
  {key: "pending", value: summary.value.pending},
  {key: "revenue-today", value: money(summary.value.revenue)},
  {key: "customers", value: summary.value.customers}
]);

const ordersSeries = computed(() => ordersPerDay(orders.value).map(({date, value}) => ({label: dayLabel(date), value})));
const revenueSeries = computed(() => revenuePerDay(payments.value).map(({date, value}) => ({label: dayLabel(date), value})));
const servicesRanking = computed(() => topServices(orders.value)
    .map(({serviceType, count}) => ({label: t(`orders.service.${serviceType}`), value: count})));
const statusSlices = computed(() => statusDistribution(orders.value, ORDER_STATUS_SEQUENCE)
    .map(({status, count}, index) => ({label: t(`orders.status.${status}`), value: count, color: STATUS_COLORS[index]})));

/** Machines that Laundry Operations reports as under maintenance. */
const alerts = computed(() => laundryResources.value
    .filter((resource) => resource.status === ResourceStatus.MAINTENANCE)
    .map((resource) => ({id: resource.id, name: resource.name})));

onMounted(() => {
  store.fetchDashboard();
  if (!resourceStore.laundryResourcesLoaded) resourceStore.fetchLaundryResources();
});
</script>

<template>
  <section class="wt-board dashboard">
    <div v-if="errors.length" class="wt-board-error">{{ t('dashboard.error') }}: {{ errors[0].message }}</div>

    <div class="kpis">
      <article v-for="kpi in kpis" :key="kpi.key" class="kpi">
        <span class="kpi-label">{{ t(`dashboard.kpis.${kpi.key}`) }}</span>
        <strong class="kpi-value">{{ loading ? '—' : kpi.value }}</strong>
      </article>
    </div>

    <div class="middle-row">
      <section>
        <h2>{{ t('dashboard.machines.title') }}</h2>
        <div class="machines">
          <article v-for="state in MACHINE_STATES" :key="state.key" class="machine">
            <span class="machine-label">
              <span class="dot" :style="{background: state.color}" aria-hidden="true"></span>
              {{ t(`dashboard.machines.${state.key}`) }}
            </span>
            <strong class="machine-value" aria-hidden="true"></strong>
          </article>
        </div>
      </section>

      <section>
        <h2>{{ t('dashboard.alerts.title') }}</h2>
        <ul v-if="alerts.length" class="alerts">
          <li v-for="alert in alerts" :key="alert.id" class="alert">
            <span class="dot alert-dot" aria-hidden="true"></span>
            <div>
              <strong>{{ t('dashboard.alerts.maintenance') }}</strong>
              <small>{{ t('dashboard.alerts.maintenance-detail', {name: alert.name}) }}</small>
            </div>
          </li>
        </ul>
        <p v-else class="alerts-empty">{{ t('dashboard.alerts.empty') }}</p>
      </section>
    </div>

    <div class="charts">
      <section class="chart">
        <h2>{{ t('dashboard.charts.orders-per-day') }}</h2>
        <div class="chart-surface">
          <bar-chart :points="ordersSeries" :aria-label="t('dashboard.charts.orders-per-day')"/>
        </div>
      </section>
      <section class="chart">
        <h2>{{ t('dashboard.charts.revenue') }}</h2>
        <div class="chart-surface">
          <line-chart :points="revenueSeries" :format="money" :aria-label="t('dashboard.charts.revenue')"/>
        </div>
      </section>
      <section class="chart">
        <h2>{{ t('dashboard.charts.top-services') }}</h2>
        <div class="chart-surface">
          <ranking-bars v-if="servicesRanking.length" :items="servicesRanking"/>
          <p v-else class="alerts-empty">{{ t('dashboard.charts.empty') }}</p>
        </div>
      </section>
      <section class="chart">
        <h2>{{ t('dashboard.charts.status-distribution') }}</h2>
        <div class="chart-surface">
          <donut-chart :slices="statusSlices" :total-label="t('dashboard.charts.status-distribution')"/>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
h2 { margin: 0 0 .75rem; font-size: .9rem; font-weight: 700; color: #123b7a; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.kpi { display: flex; flex-direction: column; gap: .35rem; padding: 1rem 1.1rem; border-radius: .75rem;
  background: #fff; box-shadow: 0 2px 10px rgba(18, 59, 122, .08); }
.kpi-label { color: #72819b; font-size: .72rem; }
.kpi-value { color: #123b7a; font-size: 1.5rem; font-weight: 700; line-height: 1.1; }
.middle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
.machines { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.machine { display: flex; flex-direction: column; gap: .45rem; min-height: 4.6rem; padding: .8rem .9rem;
  border-radius: .6rem; background: #f5f9fd; }
.machine-label { display: flex; align-items: center; gap: .35rem; color: #72819b; font-size: .66rem; }
.dot { width: .5rem; height: .5rem; border-radius: 50%; flex: 0 0 auto; }
.alerts { display: flex; flex-direction: column; gap: .75rem; margin: 0; padding: 0; list-style: none; }
.alert { display: flex; gap: .6rem; padding: .7rem .9rem; border-radius: .6rem; background: #f5f9fd; }
.alert div { display: flex; flex-direction: column; gap: .1rem; }
.alert strong { color: #1b2f55; font-size: .78rem; }
.alert small { color: #72819b; font-size: .7rem; }
.alert-dot { margin-top: .3rem; background: #eda100; }
.alerts-empty { margin: 0; padding: 1rem; border-radius: .6rem; background: #f5f9fd; color: #72819b; font-size: .75rem; }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1.5rem; }
.chart-surface { min-height: 10rem; padding: 1rem; border-radius: .6rem; background: #f5f9fd; }
@media (max-width: 900px) {
  .middle-row { grid-template-columns: 1fr; }
  .machines { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
