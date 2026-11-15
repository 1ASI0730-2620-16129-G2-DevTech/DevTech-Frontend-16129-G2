/**
 * Statuses of a payment (Subscription & Payment backend: PENDING, COMPLETED, FAILED).
 * Each value has a translation under `payments.status.<value>`.
 */
export const PaymentStatus = Object.freeze({
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed"
});

export const PAYMENT_STATUSES = Object.freeze(Object.values(PaymentStatus));
