import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TrackingNotificationApi} from "@/tracking-notifications/infrastructure/tracking-notification-api.js";
import {TrackingAssembler} from "@/tracking-notifications/infrastructure/tracking.assembler.js";
import {NotificationAssembler} from "@/tracking-notifications/infrastructure/notification.assembler.js";

const trackingNotificationApi = new TrackingNotificationApi();

const useTrackingNotificationStore = defineStore("trackingNotification", () => {
    const trackings = ref([]);

    const currentTracking = ref(null);

    const notifications = ref([]);

    const errors = ref([]);

    const trackingsLoaded = ref(false);

    const trackingsCount = computed(() => {
        return trackingsLoaded.value ? trackings.value.length : 0;
    });

    function fetchTrackings() {
        trackingNotificationApi.getTrackings().then((response) => {
            trackings.value = TrackingAssembler.toEntitiesFromResponse(response);
            trackingsLoaded.value = true;
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function fetchTracking(orderId) {
        trackingNotificationApi.getTrackingByOrderId(orderId).then((response) => {
            currentTracking.value = TrackingAssembler.toEntitiesFromResponse(response)[0] ?? null;
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function getTrackingById(id) {
        let idNum = parseInt(id);
        return trackings.value.find(tracking => tracking["id"] === idNum);
    }

    function addTracking(tracking) {
        trackingNotificationApi.createTracking(tracking).then((response) => {
            const resource = response.data;
            const newTracking = TrackingAssembler.toEntityFromResource(resource);
            trackings.value.push(newTracking);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function updateTracking(tracking) {
        trackingNotificationApi.updateTracking(tracking).then((response) => {
            const resource = response.data;
            const updatedTracking = TrackingAssembler.toEntityFromResource(resource);
            const index = trackings.value.findIndex(t => t["id"] === updatedTracking.id);
            if (index !== -1) {
                trackings.value[index] = updatedTracking;
            }
            if (currentTracking.value?.id === updatedTracking.id) {
                currentTracking.value = updatedTracking;
            }
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function deleteTracking(tracking) {
        trackingNotificationApi.deleteTracking(tracking.id).then(() => {
            const index = trackings.value.findIndex(t => t["id"] === tracking.id);
            if (index !== -1) {
                trackings.value.splice(index, 1);
            }
            if (currentTracking.value?.id === tracking.id) {
                currentTracking.value = null;
            }
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function fetchUnreadNotifications(userId) {
        trackingNotificationApi.getUnreadNotificationsByUser(userId).then((response) => {
            notifications.value = NotificationAssembler.toEntitiesFromResponse(response);
        }).catch((error) => {
            console.error(error);
        });
    }

    function getNotificationById(id) {
        let idNum = parseInt(id);
        return notifications.value.find(notification => notification["id"] === idNum);
    }

    function addNotification(notification) {
        trackingNotificationApi.createNotification(notification).then((response) => {
            const resource = response.data;
            const newNotification = NotificationAssembler.toEntityFromResource(resource);
            notifications.value.push(newNotification);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function updateNotification(notification) {
        trackingNotificationApi.updateNotification(notification).then((response) => {
            const resource = response.data;
            const updatedNotification = NotificationAssembler.toEntityFromResource(resource);
            const index = notifications.value.findIndex(n => n["id"] === updatedNotification.id);
            if (index !== -1) {
                notifications.value[index] = updatedNotification;
            }
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function markNotificationAsRead(id) {
        trackingNotificationApi.markAsRead(id).then((response) => {
            const resource = response.data;
            const updatedNotification = NotificationAssembler.toEntityFromResource(resource);
            const index = notifications.value.findIndex(n => n["id"] === updatedNotification.id);
            if (index !== -1) {
                notifications.value[index] = updatedNotification;
            }
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function deleteNotification(notification) {
        trackingNotificationApi.deleteNotification(notification.id).then(() => {
            const index = notifications.value.findIndex(n => n["id"] === notification.id);
            if (index !== -1) {
                notifications.value.splice(index, 1);
            }
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    return {
        trackings,
        currentTracking,
        notifications,
        errors,
        trackingsLoaded,
        trackingsCount,
        fetchTrackings,
        fetchTracking,
        getTrackingById,
        addTracking,
        updateTracking,
        deleteTracking,
        fetchUnreadNotifications,
        getNotificationById,
        addNotification,
        updateNotification,
        markNotificationAsRead,
        deleteNotification
    };
});

export default useTrackingNotificationStore;