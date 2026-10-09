<script setup>
import {onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useServiceCatalogStore} from "../../application/service-catalog.store.js";
import CatalogPage from "../components/catalog-page.vue";

const store = useServiceCatalogStore();
const {services, orders, loading, errors} = storeToRefs(store);

onMounted(() => store.fetchServices());
</script>

<template>
  <catalog-page i18n-key="services" :items="services" :orders="orders" :loading="loading" :errors="errors"
                :create="store.createService"/>
</template>
