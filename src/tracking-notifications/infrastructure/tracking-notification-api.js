import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const trackingEndpointPath = import.meta.env.VITE_TRACKING_ENDPOINT_PATH;
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH;

export class TrackingNotificationApi extends BaseApi {
    #trackingEndpoint;
    #notificationsEndpoint;

    constructor() {
        super();
        this.#trackingEndpoint = new BaseEndpoint(this, trackingEndpointPath);
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath);
    }

    getTrackings() {
        return this.#trackingEndpoint.getAll();
    }

    getTrackingById(id) {
        return this.#trackingEndpoint.getById(id);
    }

    getTrackingByOrderId(orderId) {
        return this.#trackingEndpoint.http.get(this.#trackingEndpoint.endpointPath, { params: { orderId } });
    }

    createTracking(resource) {
        return this.#trackingEndpoint.create(resource);
    }

    updateTracking(resource) {
        return this.#trackingEndpoint.update(resource.id, resource);
    }

    deleteTracking(id) {
        return this.#trackingEndpoint.delete(id);
    }

    getNotifications() {
        return this.#notificationsEndpoint.getAll();
    }

    getNotificationById(id) {
        return this.#notificationsEndpoint.getById(id);
    }

    getNotificationsByUser(userId) {
        return this.#notificationsEndpoint.http.get(this.#notificationsEndpoint.endpointPath, { params: { userId } });
    }

    getUnreadNotificationsByUser(userId) {
        return this.#notificationsEndpoint.http.get(this.#notificationsEndpoint.endpointPath, { params: { userId, isRead: false } });
    }

    createNotification(resource) {
        return this.#notificationsEndpoint.create(resource);
    }

    updateNotification(resource) {
        return this.#notificationsEndpoint.update(resource.id, resource);
    }

    markAsRead(notificationId) {
        return this.#notificationsEndpoint.http.patch(`${this.#notificationsEndpoint.endpointPath}/${notificationId}`, { isRead: true });
    }

    deleteNotification(id) {
        return this.#notificationsEndpoint.delete(id);
    }
}