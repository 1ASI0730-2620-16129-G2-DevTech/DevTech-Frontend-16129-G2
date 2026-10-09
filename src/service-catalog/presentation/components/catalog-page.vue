<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import DemandChart from "./demand-chart.vue";
import CatalogItemDialog from "./catalog-item-dialog.vue";
import {mergeSort} from "@/shared/domain/model/merge-sort.js";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";

const props = defineProps({
  /** i18n block of the page: "services" or "garments". */
  i18nKey: {type: String, required: true},
  items: {type: Array, default: () => []},
  orders: {type: Array, default: () => []},
  loading: {type: Boolean, default: false},
  errors: {type: Array, default: () => []},
  /** Saves a new item and resolves to it, or to null on failure. */
  create: {type: Function, required: true}
});

const {t} = useI18n();
const dialogVisible = ref(false);
const saving = ref(false);
const saveError = ref("");

const {query} = useBoardSearch();
const sortedItems = computed(() =>
    mergeSort(props.items, (a, b) => a.id.localeCompare(b.id, undefined, {numeric: true})));
const visibleItems = computed(() =>
    searchItems(sortedItems.value, (item) => [item.id, item.name, item.category], query.value));
const categories = computed(() => [...new Set(props.items.map((item) => item.category))].sort());

function formatPrice(price) {
  return new Intl.NumberFormat("es-PE", {style: "currency", currency: "PEN"}).format(price);
}

function openCreateDialog() {
  saveError.value = "";
  dialogVisible.value = true;
}

async function save(fields) {
  saving.value = true;
  saveError.value = "";
  const created = await props.create(fields);
  saving.value = false;
  if (!created) {
    saveError.value = props.errors[0]?.message ?? t("catalog.error");
    return;
  }
  dialogVisible.value = false;
}
</script>

<template>
  <section class="wt-board">
    <div class="wt-board-heading">
      <h1>{{ t(`${i18nKey}.catalog-title`, {count: items.length}) }}</h1>
      <pv-button :label="t(`${i18nKey}.new`)" icon="pi pi-plus" @click="openCreateDialog"/>
    </div>

    <div v-if="errors.length && !dialogVisible" class="wt-board-error">{{ t('catalog.error') }}: {{ errors[0].message }}</div>

    <div class="wt-board-panel">
      <div v-if="loading && !items.length" class="wt-board-empty">{{ t('catalog.loading') }}</div>
      <div v-else-if="!items.length" class="wt-board-empty">{{ t(`${i18nKey}.empty`) }}</div>
      <div v-else-if="!visibleItems.length" class="wt-board-empty">{{ t('board-search.no-results', {query}) }}</div>
      <table v-else class="wt-board-table">
        <thead>
          <tr>
            <th>{{ t('catalog.columns.id') }}</th>
            <th>{{ t(`${i18nKey}.name-column`) }}</th>
            <th>{{ t('catalog.columns.category') }}</th>
            <th class="wt-centered">{{ t('catalog.columns.base-price') }}</th>
            <th class="wt-centered">{{ t('catalog.columns.estimated-time') }}</th>
            <th class="wt-centered">{{ t('catalog.columns.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visibleItems" :key="item.id">
            <td class="wt-board-id">#{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td class="wt-centered">{{ formatPrice(item.basePrice) }}</td>
            <td class="wt-centered">{{ item.estimatedHours }} H</td>
            <td class="wt-centered">
              <pv-tag :value="t(item.active ? 'catalog.status.active' : 'catalog.status.inactive')"
                      :severity="item.active ? 'success' : 'secondary'"/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <demand-chart :items="items" :orders="orders" :title-key="`${i18nKey}.chart-title`"/>

    <catalog-item-dialog v-model:visible="dialogVisible" :title-key="`${i18nKey}.form-title`" :categories="categories"
                         :saving="saving" :error-message="saveError" @save="save"/>
  </section>
</template>
