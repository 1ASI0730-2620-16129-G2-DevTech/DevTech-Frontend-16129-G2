export const PaymentStatus = Object.freeze({
    PAID: "paid",
    PENDING: "pending",
    CANCELLED: "cancelled"
});

export const PAYMENT_STATUSES = Object.freeze(Object.values(PaymentStatus));