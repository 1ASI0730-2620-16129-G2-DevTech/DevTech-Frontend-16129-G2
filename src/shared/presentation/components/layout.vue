<script setup>
import {ref} from "vue";
import Sidebar from "@/shared/presentation/components/sidebar.vue";
import Topbar from "@/shared/presentation/components/topbar.vue";

const sidebarOpen = ref(false);
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="app-shell">
    <sidebar :open="sidebarOpen" @navigate="sidebarOpen = false"/>
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>
    <div class="content">
      <topbar @toggle-sidebar="sidebarOpen = !sidebarOpen"/>
      <main class="main">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.main {
  flex: 1;
  padding: 0 1.5rem 1.5rem;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(11, 25, 44, 0.4);
}
</style>
