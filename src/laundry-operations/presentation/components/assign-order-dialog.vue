<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

const props = defineProps({
  visible: {type: Boolean, default: false},
  order: {type: Object, default: null},
  cycles: {type: Array, default: () => []},
  resources: {type: Array, default: () => []}
});
const emit = defineEmits(['update:visible', 'confirm']);

const {t} = useI18n();
const cycleId = ref(null);
const resourceId = ref(null);

watch(() => props.order, (order) => {
  cycleId.value = order?.washingCycleId ?? null;
  resourceId.value = order?.resourceId ?? null;
}, {immediate: true});

const canConfirm = computed(() => !!cycleId.value && !!resourceId.value);

const confirm = () => {
  emit('confirm', {orderId: props.order.id, cycleId: cycleId.value, resourceId: resourceId.value});
  emit('update:visible', false);
};
</script>

<template>
  <pv-dialog :visible="visible" modal :header="t('laundry-operations.assign.title')" :style="{width: '28rem'}"
             @update:visible="emit('update:visible', $event)">
    <div class="field mb-3">
      <label for="cycle">{{ t('laundry-operations.assign.cycle') }}</label>
      <pv-select id="cycle" v-model="cycleId" :options="cycles" option-label="name" option-value="id" class="w-full"/>
    </div>
    <div class="field mb-3">
      <label for="resource">{{ t('laundry-operations.assign.resource') }}</label>
      <pv-select id="resource" v-model="resourceId" :options="resources" option-label="name" option-value="id"
                 class="w-full"/>
    </div>
    <template #footer>
      <pv-button :label="t('laundry-operations.common.cancel')" severity="secondary" outlined
                 @click="emit('update:visible', false)"/>
      <pv-button :label="t('laundry-operations.common.save')" icon="pi pi-check" :disabled="!canConfirm"
                 @click="confirm"/>
    </template>
  </pv-dialog>
</template>

<style scoped>

</style>
