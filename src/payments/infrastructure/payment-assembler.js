import {Payment} from "../domain/model/payment.js";

export class PaymentAssembler {
    static toEntityFromResource(resource) {
        return new Payment({...resource});
    }

    static toResourceFromEntity(payment) {
        return {
            id: payment.id,
            orderId: payment.orderId,
            customerId: payment.customerId,
            customerName: payment.customerName,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
            orderDate: payment.orderDate.toISOString()
        };
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data?.payments ?? [];
        return resources.map((resource) => this.toEntityFromResource(resource));
    }
}