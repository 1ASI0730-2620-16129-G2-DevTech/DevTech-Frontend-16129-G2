<script setup>
import {useI18n} from "vue-i18n";
import {computed} from "vue";

const props = defineProps({
  stage: { type: String, required: true }
});

const { t } = useI18n();

const severity = computed(() => {
  if (props.stage === 'ready') return 'success';
  if (props.stage === 'received') return 'secondary';
  return 'info';
});
</script>

<template>
  <pv-tag :value="t(`tracking.stages.${stage}`)" :severity="severity" />
</template>

<style scoped>

</style>