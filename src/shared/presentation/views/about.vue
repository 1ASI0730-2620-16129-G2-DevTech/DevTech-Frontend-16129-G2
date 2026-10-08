<script setup>
import {useI18n} from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <section class="surface-card p-4 border-round-lg" style="background: var(--wt-surface)">
    <div class="flex flex-column gap-3">
      <h2 class="m-0">{{ t('about.title') }}</h2>
      <p class="m-0 line-height-3">{{ t('about.content') }}</p>
    </div>
  </section>
</template>
