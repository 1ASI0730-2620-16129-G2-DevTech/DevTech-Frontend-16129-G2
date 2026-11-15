import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BackendApi, currentLaundryId} from "@/shared/infrastructure/backend-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

// The dashboard only reads: each collection belongs to its own bounded context.
// Orders and payments come from the backend; customers are still on the mock API.
const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;
const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;

export class DashboardApi extends BackendApi {
    #paymentsEndpoint;
    #customersEndpoint;

    constructor() {
        super();
        if (!ordersEndpointPath || !paymentsEndpointPath || !customersEndpointPath) {
            throw new Error("VITE_ORDERS_ENDPOINT_PATH, VITE_PAYMENTS_ENDPOINT_PATH and VITE_CUSTOMERS_ENDPOINT_PATH must be defined in the .env files");
        }
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath);
        this.#customersEndpoint = new BaseEndpoint(new BaseApi(), customersEndpointPath);
    }

    /** Orders of the current laundry. */
    getOrders() {
        return this.http.get(ordersEndpointPath, {params: {laundryId: currentLaundryId}});
    }

    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    getCustomers() {
        return this.#customersEndpoint.getAll();
    }
}
