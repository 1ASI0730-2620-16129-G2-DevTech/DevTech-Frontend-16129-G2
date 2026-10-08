<script setup>
import {useI18n} from "vue-i18n";
import {navigationGroups} from "@/shared/presentation/navigation-items.js";

defineProps({
  open: {type: Boolean, default: false}
});
const emit = defineEmits(['navigate']);

const {t} = useI18n();

// Placeholder user taken from the mockups. To replace when IAM is implemented.
const currentUser = {fullName: 'Carla Reyes', roleKey: 'layout.role-shift-manager'};
</script>

<template>
  <aside class="sidebar" :class="{open}">
    <div class="brand">
      <span class="brand-logo"></span>
      <span class="brand-name">WashTrack</span>
    </div>

    <nav class="nav">
      <div v-for="(group, index) in navigationGroups" :key="index" class="nav-group">
        <span v-if="group.labelKey" class="nav-group-label">{{ t(group.labelKey) }}</span>
        <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="nav-item"
                     active-class="active" @click="emit('navigate')">
          <span class="dot"></span>
          {{ t(item.labelKey) }}
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card">
        <span class="user-avatar"></span>
        <div class="flex flex-column">
          <strong class="text-sm">{{ currentUser.fullName }}</strong>
          <small class="user-role">{{ t(currentUser.roleKey) }}</small>
        </div>
      </div>
      <router-link to="/about" class="footer-link" @click="emit('navigate')">{{ t('option.about') }}</router-link>
      <a href="#" class="footer-link" @click.prevent>{{ t('layout.logout') }}</a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 16rem;
  height: 100vh;
  padding: 1.25rem 1rem;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  overflow-y: auto;
  background: var(--wt-white);
  border-right: 1px solid var(--wt-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem;
}

.brand-logo {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--wt-secondary);
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--wt-primary);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-group-label {
  padding: 0 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a90;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--wt-primary);
}

.nav-item:hover {
  background: var(--wt-surface);
}

.nav-item.active {
  background: var(--wt-secondary);
  color: var(--wt-white);
  font-weight: 500;
}

.dot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--wt-surface);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--wt-primary);
}

.user-role {
  color: #6b7a90;
}

.footer-link {
  padding: 0 0.75rem;
  font-size: 0.85rem;
  color: var(--wt-secondary);
}

@media (max-width: 960px) {
  .sidebar {
    position: fixed;
    left: 0;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 0 0 24px rgba(11, 25, 44, 0.25);
  }
}
</style>
