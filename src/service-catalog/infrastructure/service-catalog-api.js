import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const servicesEndpointPath = import.meta.env.VITE_SERVICES_ENDPOINT_PATH;
const garmentsEndpointPath = import.meta.env.VITE_GARMENTS_ENDPOINT_PATH;
// Orders are only read, to measure how often each service and garment is requested.
const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

export class ServiceCatalogApi extends BaseApi {
    #servicesEndpoint;
    #garmentsEndpoint;
    #ordersEndpoint;

    constructor() {
        super();
        if (!servicesEndpointPath || !garmentsEndpointPath || !ordersEndpointPath) {
            throw new Error("VITE_SERVICES_ENDPOINT_PATH, VITE_GARMENTS_ENDPOINT_PATH and VITE_ORDERS_ENDPOINT_PATH must be defined in the .env files");
        }
        this.#servicesEndpoint = new BaseEndpoint(this, servicesEndpointPath);
        this.#garmentsEndpoint = new BaseEndpoint(this, garmentsEndpointPath);
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
    }

    getServices() {
        return this.#servicesEndpoint.getAll();
    }

    createService(resource) {
        return this.#servicesEndpoint.create(resource);
    }

    getGarments() {
        return this.#garmentsEndpoint.getAll();
    }

    createGarment(resource) {
        return this.#garmentsEndpoint.create(resource);
    }

    getOrders() {
        return this.#ordersEndpoint.getAll();
    }
}
