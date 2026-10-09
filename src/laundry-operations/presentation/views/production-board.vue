<script setup>
import LaundryOperationsMenu from "@/laundry-operations/presentation/components/laundry-operations-menu.vue";
import LaundryOperationsSummary from "@/laundry-operations/presentation/components/laundry-operations-summary.vue";
import LaundryDashboard from "@/laundry-operations/presentation/components/laundry-dashboard.vue";
</script>

<template>
  <div>
    <laundry-operations-menu class="mb-4"/>
    <laundry-operations-summary class="mb-4"/>
    <laundry-dashboard/>
  </div>
</template>

<style scoped>

</style>
