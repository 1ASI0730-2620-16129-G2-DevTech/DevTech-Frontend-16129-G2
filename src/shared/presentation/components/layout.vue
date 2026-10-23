<script setup>
import {computed, ref, watch} from "vue";
import {useBoardSearch} from "../board-search.js";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import SidebarMenu from "./sidebar-menu.vue";
import NotificationToaster from "@/tracking-notifications/presentation/components/notification-toaster.vue";

const { t } = useI18n();
const route = useRoute();

const drawer = ref(false);
const toggleDrawer = () => {
  /**
   * Toggles the state of the drawer between open and closed.
   */
  drawer.value = !drawer.value;
}

const pageTitle = computed(() => route.meta.titleKey ? t(route.meta.titleKey) : '');

// The header search filters the board on screen; start empty on every page.
const { query } = useBoardSearch();
watch(() => route.path, () => { query.value = ''; });
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <sidebar-menu />
    </aside>
    <pv-drawer v-model:visible="drawer">
      <sidebar-menu @navigate="drawer = false" />
    </pv-drawer>

    <div class="content">
      <header class="topbar">
        <pv-button class="menu-button" icon="pi pi-bars" text :aria-label="t('menu.open')" @click="toggleDrawer" />
        <div class="titles">
          <p class="page-title">{{ pageTitle }}</p>
          <nav class="breadcrumb">
            <router-link to="/">{{ t('breadcrumb.home') }}</router-link>
            <span v-if="pageTitle"> / {{ pageTitle }}</span>
          </nav>
        </div>
        <pv-icon-field class="board-search">
          <pv-input-icon class="pi pi-search" />
          <pv-input-text v-model="query" type="search" :placeholder="t('board-search.placeholder')"
                         :aria-label="t('board-search.placeholder')" fluid />
        </pv-icon-field>
        <language-switcher />
      </header>
      <main class="main">
        <router-view />
      </main>
    </div>
    <notification-toaster />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  color-scheme: light;
  background: #ffffff;
  color: #1a2f5a;
}

.sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  width: 15rem;
  height: 100vh;
  padding: 1.25rem 1rem;
  border-right: 1px solid #e3e8f0;
  background: #fff;
}

.menu-button {
  display: none;
  --p-button-text-primary-color: #0d7ff2;
  --p-button-text-primary-hover-background: rgba(13, 127, 242, 0.12);
  --p-button-text-primary-active-background: rgba(13, 127, 242, 0.12);
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.titles {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2f5a;
}

.breadcrumb {
  font-size: 0.8rem;
  color: #6b7a99;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.main {
  flex: 1;
}

.board-search {
  width: 16rem;
}

.board-search :deep(.p-inputtext) {
  border-color: #c9d8ea;
  border-radius: .5rem;
  background: #f8fbfe;
  font-size: .8rem;
}

@media (max-width: 640px) {
  .board-search {
    width: 9rem;
  }
}

.menu-button {
  display: none;
}

@media (max-width: 960px) {
  .sidebar {
    display: none;
  }

  .menu-button {
    display: inline-flex;
  }
}
</style>