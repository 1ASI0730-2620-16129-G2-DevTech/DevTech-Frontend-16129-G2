import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

// The dashboard only reads: each collection belongs to its own bounded context.
const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;
const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;

export class DashboardApi extends BaseApi {
    #ordersEndpoint;
    #paymentsEndpoint;
    #customersEndpoint;

    constructor() {
        super();
        if (!ordersEndpointPath || !paymentsEndpointPath || !customersEndpointPath) {
            throw new Error("VITE_ORDERS_ENDPOINT_PATH, VITE_PAYMENTS_ENDPOINT_PATH and VITE_CUSTOMERS_ENDPOINT_PATH must be defined in the .env files");
        }
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath);
        this.#customersEndpoint = new BaseEndpoint(this, customersEndpointPath);
    }

    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    getCustomers() {
        return this.#customersEndpoint.getAll();
    }
}
