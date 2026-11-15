import {PaymentStatus, PAYMENT_STATUSES} from "./payment-status.js";
import {PaymentMethod, PAYMENT_METHODS} from "./payment-method.js";

/**
 * Payment of an order, as registered by the Subscription & Payment backend.
 * It references the order (Order Management) and the customer (Customer Management) by id only.
 */
export class Payment {
    /**
     * @param {Object} params
     * @param {number} params.id - Assigned by the backend.
     * @param {string} params.orderId - Order id (UUID).
     * @param {string} params.customerId - Customer code, e.g. CL005.
     * @param {number} params.amount
     * @param {string} [params.currency] - ISO 4217 code, PEN by default.
     * @param {string} [params.paymentMethod] - One of PaymentMethod.
     * @param {string} [params.status] - One of PaymentStatus.
     * @param {string|null} [params.transactionId] - Id given by the payment provider.
     * @param {Date|string|null} [params.processedAt] - When the provider processed the charge.
     */
    constructor({
        id,
        orderId,
        customerId,
        amount,
        currency = "PEN",
        paymentMethod = PaymentMethod.CARD,
        status = PaymentStatus.PENDING,
        transactionId = null,
        processedAt = null,
    }) {
        if (!Number.isInteger(id) || id <= 0) throw new Error("Payment id must be a positive integer");
        if (!orderId || !customerId) throw new Error("Payment order and customer are required");
        if (typeof amount !== "number" || amount < 0) throw new Error("Payment amount must be a positive number");
        if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Payment currency must be a 3-letter ISO 4217 code");
        if (!PAYMENT_METHODS.includes(paymentMethod)) throw new Error(`Payment method must be one of ${PAYMENT_METHODS.join(", ")}`);
        if (!PAYMENT_STATUSES.includes(status)) throw new Error(`Payment status must be one of ${PAYMENT_STATUSES.join(", ")}`);

        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.transactionId = transactionId;
        this.processedAt = processedAt ? new Date(processedAt) : null;
        Object.freeze(this);
    }

    isCompleted() { return this.status === PaymentStatus.COMPLETED; }
    isPending() { return this.status === PaymentStatus.PENDING; }
    isFailed() { return this.status === PaymentStatus.FAILED; }
}
