import {Payment} from "../domain/model/payment.js";

export class PaymentAssembler {
    static toEntityFromResource(resource) {
        return new Payment({...resource});
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data?.payments ?? [];
        return resources.map((resource) => this.toEntityFromResource(resource));
    }
}