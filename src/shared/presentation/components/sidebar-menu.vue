<script setup>
import {useI18n} from "vue-i18n";

const emit = defineEmits(['navigate']);

const { t } = useI18n();

// Entries with `to: null` belong to modules that are not built yet.
const groups = [
  { label: null, items: [
      { label: 'menu.dashboard', to: null }
    ] },
  { label: 'menu.groups.operations', items: [
      { label: 'menu.orders', to: null },
      { label: 'menu.customers', to: null },
      { label: 'menu.garments', to: null },
      { label: 'menu.services', to: null },
      { label: 'menu.payments', to: null },
      { label: 'menu.deliveries', to: '/pickups-deliveries/deliveries' },
      { label: 'menu.tracking', to: '/tracking-notifications/trackings' }
    ] },
  { label: 'menu.groups.monitoring', items: [
      { label: 'menu.iot', to: null },
      { label: 'menu.alerts', to: null }
    ] }
];

// TODO: take the signed-in user from the IAM store once the IAM context exists.
const currentUser = { name: 'Carla Reyes', role: 'shift-manager' };

// TODO: call the IAM store sign-out once the IAM context exists.
const signOut = () => {};
</script>

<template>
  <div class="sidebar-menu">
    <div class="brand">
      <span class="brand-logo"></span>
      <span class="brand-name">WashTrack</span>
    </div>

    <nav class="menu">
      <section v-for="(group, index) in groups" :key="index" class="group">
        <h2 v-if="group.label" class="group-title">{{ t(group.label) }}</h2>
        <ul>
          <li v-for="item in group.items" :key="item.label">
            <router-link v-if="item.to" :to="item.to" class="item" @click="emit('navigate')">
              {{ t(item.label) }}
            </router-link>
            <span v-else class="item disabled" :title="t('menu.coming-soon')">{{ t(item.label) }}</span>
          </li>
        </ul>
      </section>
    </nav>

    <div class="account">
      <div class="user-card">
        <span class="avatar"></span>
        <span class="user-info">
          <strong>{{ currentUser.name }}</strong>
          <small>{{ t(`roles.${currentUser.role}`) }}</small>
        </span>
      </div>
      <button type="button" class="logout" @click="signOut">{{ t('menu.logout') }}</button>
    </div>
  </div>
</template>

<style scoped>
.sidebar-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #0d7ff2;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2f5a;
}

.menu {
  flex: 1;
  overflow-y: auto;
}

.group {
  margin-bottom: 1.25rem;
}

.group-title {
  margin: 0 0 0.5rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a99;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #1a2f5a;
  text-decoration: none;
}

.item::before {
  content: '';
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.item.router-link-active {
  background: #0d7ff2;
  color: #fff;
}

.item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.account {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f4f7fb;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #1a2f5a;
}

.user-info {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.user-info small {
  color: #6b7a99;
}

.logout {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.8rem;
  color: #0d7ff2;
  cursor: pointer;
}
</style>