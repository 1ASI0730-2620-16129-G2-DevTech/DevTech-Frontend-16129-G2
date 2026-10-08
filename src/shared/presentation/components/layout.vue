<script setup>
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import SidebarMenu from "./sidebar-menu.vue";
import FooterContent from "./footer-content.vue";
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
        <language-switcher />
      </header>
      <main class="main">
        <router-view />
      </main>
      <footer-content />
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