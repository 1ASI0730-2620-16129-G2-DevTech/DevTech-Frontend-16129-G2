<script setup>
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {formatDateTime} from "../tracking-helpers.js";

const props = defineProps({
  history: { type: Array, default: () => [] }
});

const { t } = useI18n();

/** History entries, most recent first. Each entry is { stage, occurredAt }. */
const entries = computed(() => {
  return [...props.history].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
});
</script>

<template>
  <p v-if="!entries.length" class="m-0">{{ t('tracker.no-history') }}</p>
  <ul v-else class="history">
    <li v-for="(entry, index) in entries" :key="index">
      <strong>{{ t(`tracking.stages.${entry.stage}`) }}</strong>
      <span>{{ formatDateTime(entry.occurredAt) }}</span>
    </li>
  </ul>
</template>

<style scoped>
.history {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e3e8f0;
}
</style>