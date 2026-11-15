/**
 * How the customer pays an order (backend EPaymentMethod: YAPE, CARD, CASH).
 * Each value has a translation under `orders.payment-method.<value>`.
 */
export const PaymentMethod = Object.freeze({
    YAPE: "yape",
    CARD: "card",
    CASH: "cash"
});

export const PAYMENT_METHODS = Object.freeze(Object.values(PaymentMethod));
