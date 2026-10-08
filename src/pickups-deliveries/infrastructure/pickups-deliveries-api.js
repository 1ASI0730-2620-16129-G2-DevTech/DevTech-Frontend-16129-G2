import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const deliveriesEndpointPath = import.meta.env.VITE_DELIVERIES_ENDPOINT_PATH;

export class PickupsDeliveriesApi extends BaseApi {
    #deliveriesEndpoint;

    constructor() {
        super();
        this.#deliveriesEndpoint = new BaseEndpoint(this, deliveriesEndpointPath);
    }

    getDeliveries() {
        return this.#deliveriesEndpoint.getAll();
    }
}