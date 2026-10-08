<script setup>
import {useI18n} from "vue-i18n";
import TrackingItem from "./tracking-item.vue";

defineProps({
  trackings: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['view']);

const { t } = useI18n();
</script>

<template>
  <p v-if="loading">{{ t('trackings.loading') }}</p>
  <p v-else-if="!trackings.length">{{ t('trackings.empty') }}</p>
  <div v-else class="flex flex-column gap-3">
    <tracking-item v-for="tracking in trackings" :key="tracking.id" :tracking="tracking"
                   @view="emit('view', $event)" />
  </div>
</template>

<style scoped>

</style>
