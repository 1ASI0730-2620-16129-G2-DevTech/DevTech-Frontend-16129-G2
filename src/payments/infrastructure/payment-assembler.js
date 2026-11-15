import {Payment} from "../domain/model/payment.js";
import {PaymentStatus} from "../domain/model/payment-status.js";
import {customerCodeToNumber, customerNumberToCode} from "@/shared/infrastructure/customer-id-translator.js";

/** Backend status names (EPaymentStatus) to the statuses of the web app. */
const STATUS_FROM_RESOURCE = Object.freeze({
    PENDING: PaymentStatus.PENDING,
    COMPLETED: PaymentStatus.COMPLETED,
    FAILED: PaymentStatus.FAILED
});

/**
 * Maps the PaymentResource of the backend to the Payment entity and builds the CreatePaymentResource.
 */
export class PaymentAssembler {
    static toEntityFromResource(resource) {
        return new Payment({
            id: resource.id,
            orderId: resource.orderId,
            customerId: customerNumberToCode(resource.customerId),
            amount: Number(resource.amount),
            currency: resource.currency,
            paymentMethod: String(resource.paymentMethod ?? "CARD").toLowerCase(),
            status: STATUS_FROM_RESOURCE[resource.status] ?? String(resource.status).toLowerCase(),
            transactionId: resource.transactionId,
            processedAt: resource.processedAt
        });
    }

    /**
     * @param {Object} request
     * @param {string} request.orderId - Order id (UUID).
     * @param {string} request.customerId - Customer code, e.g. CL005.
     * @param {number} request.amount
     * @param {string} request.currency
     * @param {string} request.cardToken - Card tokenized by the payment provider.
     * @param {string} request.paymentMethod - One of PaymentMethod.
     * @returns {Object} CreatePaymentResource of the backend.
     */
    static toCreateResource({orderId, customerId, amount, currency, cardToken, paymentMethod}) {
        return {
            customerId: customerCodeToNumber(customerId),
            orderId,
            amount,
            currency,
            cardToken,
            paymentMethod: String(paymentMethod).toUpperCase()
        };
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : [];
        return resources.map((resource) => this.toEntityFromResource(resource));
    }
}
