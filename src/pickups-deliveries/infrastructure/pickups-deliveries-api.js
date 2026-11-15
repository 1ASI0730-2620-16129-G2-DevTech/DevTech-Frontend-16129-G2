import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BackendApi, currentLaundryId} from "@/shared/infrastructure/backend-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const deliveriesEndpointPath = import.meta.env.VITE_DELIVERIES_ENDPOINT_PATH;
const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;
const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;

/**
 * Client of the Pickups & Deliveries backend.
 * The backend lists pickups and deliveries per order, so the board also reads the orders of the laundry
 * (Order Management) and the customer names (Customer Management, still on the mock API).
 */
export class PickupsDeliveriesApi extends BackendApi {
    #deliveriesEndpoint;
    #customersEndpoint;

    constructor() {
        super();
        this.#deliveriesEndpoint = new BaseEndpoint(this, deliveriesEndpointPath);
        this.#customersEndpoint = new BaseEndpoint(new BaseApi(), customersEndpointPath);
    }

    /** Pickups and deliveries of an order. An order without any is an empty list. */
    async getDeliveriesByOrder(orderId) {
        try {
            return (await this.http.get(deliveriesEndpointPath, {params: {orderId}})).data;
        } catch (error) {
            if (error.response?.status === 404) return [];
            throw error;
        }
    }

    /** Orders of the current laundry (read only). */
    getOrders() {
        return this.http.get(ordersEndpointPath, {params: {laundryId: currentLaundryId}});
    }

    /** Customers (read only), to show who each pickup or delivery is for. */
    getCustomers() {
        return this.#customersEndpoint.getAll();
    }

    /** SchedulePickupDeliveryResource. */
    createDelivery(resource) {
        return this.#deliveriesEndpoint.create(resource);
    }
}
