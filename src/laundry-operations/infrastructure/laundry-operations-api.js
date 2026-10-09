import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const laundryOrdersEndpointPath = import.meta.env.VITE_LAUNDRY_ORDERS_ENDPOINT_PATH;
const washingCyclesEndpointPath = import.meta.env.VITE_WASHING_CYCLES_ENDPOINT_PATH;
const laundryResourcesEndpointPath = import.meta.env.VITE_LAUNDRY_RESOURCES_ENDPOINT_PATH;

export class LaundryOperationsApi extends BaseApi {
    #laundryOrdersEndpoint;
    #washingCyclesEndpoint;
    #laundryResourcesEndpoint;

    constructor() {
        super();
        this.#laundryOrdersEndpoint = new BaseEndpoint(this, laundryOrdersEndpointPath);
        this.#washingCyclesEndpoint = new BaseEndpoint(this, washingCyclesEndpointPath);
        this.#laundryResourcesEndpoint = new BaseEndpoint(this, laundryResourcesEndpointPath);
    }

    getLaundryOrders() {
        return this.#laundryOrdersEndpoint.getAll();
    }

    getLaundryOrderById(id) {
        return this.#laundryOrdersEndpoint.getById(id);
    }

    createLaundryOrder(resource) {
        return this.#laundryOrdersEndpoint.create(resource);
    }

    updateLaundryOrder(id, resource) {
        return this.#laundryOrdersEndpoint.update(id, resource);
    }

    getWashingCycles() {
        return this.#washingCyclesEndpoint.getAll();
    }

    getWashingCycleById(id) {
        return this.#washingCyclesEndpoint.getById(id);
    }

    /** WashingCycleRepository.findCompatible(type) */
    getCompatibleWashingCycles(type) {
        return this.http.get(washingCyclesEndpointPath, {params: {compatibleType: type}});
    }

    getLaundryResources() {
        return this.#laundryResourcesEndpoint.getAll();
    }

    getLaundryResourceById(id) {
        return this.#laundryResourcesEndpoint.getById(id);
    }

    updateLaundryResource(id, resource) {
        return this.#laundryResourcesEndpoint.update(id, resource);
    }
}
