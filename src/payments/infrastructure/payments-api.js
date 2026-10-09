import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;

export class PaymentsApi extends BaseApi {
    #paymentsEndpoint;

    constructor() {
        super();
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath);
    }

    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }
}