import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TrackingNotificationApi} from "@/tracking-notifications/infrastructure/tracking-notification-api.js";
import {TrackingAssembler} from "@/tracking-notifications/infrastructure/tracking.assembler.js";
import {NotificationAssembler} from "@/tracking-notifications/infrastructure/notification.assembler.js";
import {customerGuidToCode} from "@/shared/infrastructure/customer-id-translator.js";

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

    /** Customer name of each order: order (backend) -> customer code -> customer (mock API). */
    async function loadCustomerNames(orderResources) {
        const customersResponse = await trackingNotificationApi.getCustomers();
        const names = new Map(customersResponse.data.map(customer => [customer.id, customer.fullName]));
        return new Map(orderResources.map(order => [order.id, names.get(customerGuidToCode(order.customerId)) ?? '']));
    }

    /**
     * Trackings of every order. The stages come from the backend, which records them by itself
     * every time the order advances on the Production Board.
     */
    async function fetchTrackings() {
        try {
            const [trackingsResponse, ordersResponse] = await Promise.all([
                trackingNotificationApi.getTrackings(),
                trackingNotificationApi.getOrders()
            ]);
            const customerNames = await loadCustomerNames(ordersResponse.data);
            trackings.value = TrackingAssembler.toEntitiesFromResponse(trackingsResponse,
                orderId => customerNames.get(orderId) ?? '');
            trackingsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
        }
    }

    /** Tracking of one order, for the tracker view. */
    async function fetchTracking(orderId) {
        try {
            const response = await trackingNotificationApi.getTrackingByOrderId(orderId);
            const resource = Array.isArray(response.data) ? response.data[0] : null;
            if (!resource) {
                currentTracking.value = null;
                return;
            }
            const order = await trackingNotificationApi.getOrderById(orderId).then(r => r.data).catch(() => null);
            const customerNames = order ? await loadCustomerNames([order]) : new Map();
            currentTracking.value = TrackingAssembler.toEntityFromResource(resource, customerNames.get(orderId) ?? '');
        } catch (error) {
            errors.value.push(error);
        }
    }

    function getTrackingById(id) {
        let idNum = parseInt(id);
        return trackings.value.find(tracking => tracking["id"] === idNum);
    }

    /**
     * Starts the tracking of a new order at the "received" stage. The backend may have started it already
     * (when Laundry Operations received the order); then it keeps that one and stores the estimated delivery.
     * @returns {Promise<OrderTracking|null>} The tracking, or null when it could not be registered.
     */
    async function startTracking({orderId, customerName, estimatedDelivery}) {
        try {
            const response = await trackingNotificationApi.createTracking(
                TrackingAssembler.toStartResource({orderId, estimatedDelivery}));
            const started = TrackingAssembler.toEntityFromResource(response.data, customerName);
            if (trackingsLoaded.value) {
                trackings.value = [...trackings.value.filter(t => t.id !== started.id), started];
            }
            return started;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
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
        startTracking,
        fetchUnreadNotifications,
        getNotificationById,
        addNotification,
        updateNotification,
        markNotificationAsRead,
        deleteNotification
    };
});

export default useTrackingNotificationStore;