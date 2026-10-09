<script setup>
import {onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useServiceCatalogStore} from "../../application/service-catalog.store.js";
import CatalogPage from "../components/catalog-page.vue";

const store = useServiceCatalogStore();
const {garments, orders, loading, errors} = storeToRefs(store);

onMounted(() => store.fetchGarments());
</script>

<template>
  <catalog-page i18n-key="garments" :items="garments" :orders="orders" :loading="loading" :errors="errors"
                :create="store.createGarment"/>
</template>
