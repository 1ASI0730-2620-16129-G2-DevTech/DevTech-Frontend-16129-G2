<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const unavailableRoute = route.path;
const { t } = useI18n();
</script>

<template>
  <section class="surface-card p-4 border-round-lg" style="background: var(--wt-surface)">
    <div class="flex flex-column gap-3">
      <h2 class="m-0">{{ t('page-not-found.title') }}</h2>
      <p class="m-0 line-height-3">
        {{ t('page-not-found.content', { 'unavailable-route': unavailableRoute }) }}
      </p>
      <router-link to="/home" class="font-medium" style="color: var(--wt-secondary)">
        {{ t('page-not-found.go-home') }}
      </router-link>
    </div>
  </section>
</template>
