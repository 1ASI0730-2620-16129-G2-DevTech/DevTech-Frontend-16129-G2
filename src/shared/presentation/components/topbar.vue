<script setup>
import {computed} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "@/shared/presentation/components/language-switcher.vue";

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();
const {t} = useI18n();

/** Page title and breadcrumb come from the `titleKey` declared in the route meta. */
const title = computed(() => route.meta.titleKey ? t(route.meta.titleKey) : '');
</script>

<template>
  <header class="topbar">
    <div class="flex align-items-center gap-2">
      <pv-button class="menu-button" icon="pi pi-bars" text rounded :aria-label="t('layout.open-menu')"
                 @click="emit('toggle-sidebar')"/>
      <div>
        <h1 class="page-title m-0">{{ title }}</h1>
        <small class="breadcrumb">{{ t('layout.breadcrumb-home') }} / {{ title }}</small>
      </div>
    </div>

    <div class="topbar-actions">
      <pv-icon-field class="search">
        <pv-input-icon class="pi pi-search"/>
        <pv-input-text :placeholder="t('layout.search')" class="w-full"/>
      </pv-icon-field>
      <language-switcher/>
      <pv-button icon="pi pi-bell" rounded severity="secondary" :aria-label="t('layout.notifications')"/>
      <span class="avatar"><i class="pi pi-user"></i></span>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--wt-white);
}

.page-title {
  font-size: 1.5rem;
}

.breadcrumb {
  color: #6b7a90;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search {
  width: 18rem;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  color: var(--wt-white);
  background: var(--wt-primary);
}

.menu-button {
  display: none;
}

@media (max-width: 960px) {
  .menu-button {
    display: inline-flex;
  }

  .search {
    display: none;
  }
}
</style>
