<script setup>
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {ORDER_STAGES} from "../tracking-helpers.js";

const props = defineProps({
  currentStage: { type: String, default: '' },
  stages: { type: Array, default: () => ORDER_STAGES }
});

const { t } = useI18n();

/**
 * Steps of the stepper with their state: 'completed', 'current' or 'pending'.
 * When the order reaches the last stage ('ready') every step is completed.
 */
const steps = computed(() => {
  const currentIndex = props.stages.indexOf(props.currentStage);
  const isLastStage = currentIndex === props.stages.length - 1;
  return props.stages.map((stage, index) => {
    let state = 'pending';
    if (currentIndex >= 0) {
      if (index < currentIndex || (isLastStage && index === currentIndex)) state = 'completed';
      else if (index === currentIndex) state = 'current';
    }
    return { stage, state };
  });
});
</script>

<template>
  <ol class="stepper">
    <li v-for="step in steps" :key="step.stage" class="step" :class="step.state">
      <span class="step-circle">
        <i v-if="step.state === 'completed'" class="pi pi-check"></i>
      </span>
      <span class="step-text">
        <span class="step-label">{{ t(`tracking.stages.${step.stage}`) }}</span>
        <span class="step-status">{{ t(`tracking.status.${step.state}`) }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
}

.step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
}

.step + .step::before {
  content: '';
  position: absolute;
  top: 1rem;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #cfd8e6;
}

.step.completed + .step::before,
.step.current::before {
  background: #3ccf5e;
}

.step-circle {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid #cfd8e6;
  background: #fff;
  color: #fff;
}

.step.completed .step-circle {
  background: #3ccf5e;
  border-color: #3ccf5e;
}

.step.current .step-circle {
  background: #12c9b0;
  border-color: #12c9b0;
}

.step-text {
  display: flex;
  flex-direction: column;
}

.step-label {
  font-weight: 600;
}

.step-status {
  color: #6b7a99;
}

@media (max-width: 600px) {
  .stepper {
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    flex-direction: row;
    text-align: left;
  }

  .step + .step::before {
    display: none;
  }
}
</style>