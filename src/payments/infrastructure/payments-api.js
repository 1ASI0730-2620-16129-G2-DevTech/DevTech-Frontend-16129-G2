import {BackendApi} from "@/shared/infrastructure/backend-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;

/** Client of the payments endpoints of the Subscription & Payment backend. */
export class PaymentsApi extends BackendApi {
    #paymentsEndpoint;

    constructor() {
        super();
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath);
    }

    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    /** Creates the payment and charges it through the payment gateway (it stays PENDING until confirmed). */
    createPayment(resource) {
        return this.#paymentsEndpoint.create(resource);
    }

    /** Confirms an approved payment (PENDING -> COMPLETED). */
    confirmPayment(paymentId) {
        return this.http.post(`${paymentsEndpointPath}/${paymentId}/confirmation`);
    }
}
