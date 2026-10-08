<script setup>
import {useI18n} from "vue-i18n";

const {t} = useI18n();

const items = [
  {routeName: 'laundry-operations-production-board', label: 'laundry-operations.menu.production-board'},
  {routeName: 'laundry-operations-resources', label: 'laundry-operations.menu.resources'},
  {routeName: 'laundry-operations-washing-cycles', label: 'laundry-operations.menu.washing-cycles'}
];
</script>

<template>
  <nav class="flex flex-wrap gap-2">
    <router-link v-for="item in items" :key="item.routeName" :to="{name: item.routeName}" custom
                 v-slot="{navigate, isActive}">
      <pv-button :label="t(item.label)" :severity="isActive ? undefined : 'secondary'" :text="!isActive"
                 @click="navigate"/>
    </router-link>
  </nav>
</template>

<style scoped>

</style>
