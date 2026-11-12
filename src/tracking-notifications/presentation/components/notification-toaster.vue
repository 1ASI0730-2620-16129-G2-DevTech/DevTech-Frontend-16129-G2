<script setup>
import {computed, onBeforeUnmount, onMounted, toRefs, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import useTrackingNotificationStore from "../../application/tracking-notification.store.js";
import {formatOrderCode} from "../tracking-helpers.js";
import useIamStore from "@/iam/application/iam.store.js";

const pollingIntervalInMilliseconds = Number(import.meta.env.VITE_NOTIFICATIONS_POLLING_INTERVAL);
const toastLifetimeInMilliseconds = Number(import.meta.env.VITE_NOTIFICATIONS_TOAST_LIFETIME);
const toastGroup = 'notifications';

const { t, te } = useI18n();
const toast = useToast();
const store = useTrackingNotificationStore();
const { notifications } = toRefs(store);
const { fetchUnreadNotifications, markNotificationAsRead } = store;

// Notifications belong to the signed-in user, identified by their business code (for example CL001).
const iamStore = useIamStore();
const userId = computed(() => iamStore.currentUser?.code ?? '');

/** Reads the unread notifications of the signed-in user; a user without code has none. */
const refreshNotifications = () => {
  if (userId.value) fetchUnreadNotifications(userId.value);
};

// Ids already shown, so a notification is never displayed twice even if marking it as read fails.
const shownNotificationIds = new Set();
let pollingTimer = null;

/**
 * Show a notification as a closable toast in the top-right corner.
 * @param {Object} notification - The notification to show.
 */
const showNotification = (notification) => {
  const messageKey = `notifications.types.${notification.type}`;
  if (!te(`${messageKey}.summary`)) return;

  const { orderId, stage } = notification.parameters;
  toast.add({
    group: toastGroup,
    severity: 'info',
    summary: t(`${messageKey}.summary`),
    detail: t(`${messageKey}.detail`, {
      code: formatOrderCode(orderId),
      stage: stage ? t(`tracking.stages.${stage}`) : ''
    }),
    life: toastLifetimeInMilliseconds
  });
};

watch(notifications, (unreadNotifications) => {
  [...unreadNotifications]
      .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))
      .forEach((notification) => {
        if (shownNotificationIds.has(notification.id)) return;
        shownNotificationIds.add(notification.id);
        showNotification(notification);
        markNotificationAsRead(notification.id);
      });
});

onMounted(() => {
  refreshNotifications();
  pollingTimer = setInterval(refreshNotifications, pollingIntervalInMilliseconds);
});

onBeforeUnmount(() => clearInterval(pollingTimer));
</script>

<template>
  <pv-toast position="top-right" :group="toastGroup"
            :breakpoints="{ '575px': { width: 'calc(100% - 2rem)', right: '1rem', left: '1rem' } }" />
</template>