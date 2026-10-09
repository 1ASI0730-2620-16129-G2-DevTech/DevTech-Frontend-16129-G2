<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useCustomersStore} from "../../application/customers.store.js";
import CustomerCreateDialog from "../components/customer-create-dialog.vue";
import {searchItems, useBoardSearch} from "@/shared/presentation/board-search.js";

const {t} = useI18n();
const customersStore = useCustomersStore();
const {customers, sortedCustomers, loading, errors} = storeToRefs(customersStore);

const {query} = useBoardSearch();
const visibleCustomers = computed(() => searchItems(sortedCustomers.value,
    (customer) => [customer.id, customer.fullName, customer.phone, customer.phone.replace(/\s/g, ""),
      customer.documentType, customer.documentNumber], query.value));

const dialogVisible = ref(false);
const saving = ref(false);
const saveError = ref("");

function openCreateDialog() {
  saveError.value = "";
  dialogVisible.value = true;
}

async function createCustomer(form) {
  saving.value = true;
  saveError.value = "";
  const customer = await customersStore.createCustomer(form);
  saving.value = false;
  if (!customer) {
    saveError.value = errors.value[0]?.message ?? t("customers.error");
    return;
  }
  dialogVisible.value = false;
}

onMounted(() => customersStore.fetchCustomers());
</script>

<template>
  <section class="wt-board">
    <div class="wt-board-heading">
      <h1>{{ t('customers.catalog-title', {count: customers.length}) }}</h1>
      <pv-button :label="t('customers.new')" icon="pi pi-plus" @click="openCreateDialog"/>
    </div>

    <div v-if="errors.length && !dialogVisible" class="wt-board-error">{{ t('customers.error') }}: {{ errors[0].message }}</div>

    <div class="wt-board-panel">
      <div v-if="loading && !customers.length" class="wt-board-empty">{{ t('customers.loading') }}</div>
      <div v-else-if="!customers.length" class="wt-board-empty">{{ t('customers.empty') }}</div>
      <div v-else-if="!visibleCustomers.length" class="wt-board-empty">{{ t('board-search.no-results', {query}) }}</div>
      <table v-else class="wt-board-table">
        <thead>
          <tr>
            <th>{{ t('customers.columns.id') }}</th>
            <th>{{ t('customers.columns.customer') }}</th>
            <th>{{ t('customers.columns.phone') }}</th>
            <th class="wt-centered">{{ t('customers.columns.document-type') }}</th>
            <th>{{ t('customers.columns.document') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in visibleCustomers" :key="customer.id">
            <td class="wt-board-id">#{{ customer.id }}</td>
            <td>{{ customer.fullName }}</td>
            <td>{{ customer.phone }}</td>
            <td class="wt-centered">{{ customer.documentType }}</td>
            <td>{{ customer.documentNumber }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <customer-create-dialog v-model:visible="dialogVisible" :saving="saving" :error-message="saveError"
                            @save="createCustomer"/>
  </section>
</template>
