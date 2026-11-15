import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BackendApi, currentLaundryId} from "@/shared/infrastructure/backend-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const trackingEndpointPath = import.meta.env.VITE_TRACKING_ENDPOINT_PATH;
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH;
const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;
const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;

/**
 * Trackings live in the Tracking & Notifications backend, which records each stage by itself when
 * Laundry Operations advances an order. Notifications are still on the mock API.
 * Orders (backend) and customers (mock) are only read, to show whose order each tracking is.
 */
export class TrackingNotificationApi extends BaseApi {
    #backendApi = new BackendApi();
    #trackingEndpoint;
    #notificationsEndpoint;
    #customersEndpoint;

    constructor() {
        super();
        this.#trackingEndpoint = new BaseEndpoint(this.#backendApi, trackingEndpointPath);
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath);
        this.#customersEndpoint = new BaseEndpoint(this, customersEndpointPath);
    }

    getTrackings() {
        return this.#trackingEndpoint.getAll();
    }

    getTrackingByOrderId(orderId) {
        return this.#trackingEndpoint.http.get(this.#trackingEndpoint.endpointPath, { params: { orderId } });
    }

    /** Starts the tracking of an order (StartTrackingResource); starting it twice returns the same tracking. */
    createTracking(resource) {
        return this.#trackingEndpoint.create(resource);
    }

    /** Orders of the current laundry (read only). */
    getOrders() {
        return this.#backendApi.http.get(ordersEndpointPath, { params: { laundryId: currentLaundryId } });
    }

    /** One order (read only). */
    getOrderById(orderId) {
        return this.#backendApi.http.get(`${ordersEndpointPath}/${orderId}`);
    }

    /** Customers (read only). */
    getCustomers() {
        return this.#customersEndpoint.getAll();
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