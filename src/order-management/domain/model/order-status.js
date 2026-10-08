/**
 * Lifecycle of an order, in order.
 */
export const OrderStatus = Object.freeze({
    CREATED: "CREATED",
    RECEIVED: "RECEIVED",
    CLASSIFIED: "CLASSIFIED",
    IN_PROCESS: "IN_PROCESS",
    READY: "READY",
    DELIVERED: "DELIVERED",
});

/** Statuses in lifecycle order. */
export const ORDER_STATUS_SEQUENCE = Object.freeze(Object.values(OrderStatus));
