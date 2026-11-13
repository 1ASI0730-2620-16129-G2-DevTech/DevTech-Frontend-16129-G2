/**
 * Order tracking aggregate of the Tracking & Notifications bounded context.
 * Represents the current stage of an order and the history of its stage changes.
 */
export class OrderTracking {
    /**
     * @param {Object} props
     * @param {number|null} props.id - Tracking identifier.
     * @param {number|string|null} props.orderId - Identifier of the tracked order.
     * @param {string} props.customerName - Full name of the customer who owns the order.
     * @param {string} props.currentStage - Current processing stage of the order.
     * @param {string} props.estimatedDelivery - Estimated delivery date (ISO string).
     * @param {Object[]} props.history - Stage changes recorded for the order.
     */
    constructor({ id = null, orderId = null, customerName = '', currentStage = '', estimatedDelivery = '', history = [] }) {
        this.id = id;
        this.orderId = orderId;
        this.customerName = customerName;
        this.currentStage = currentStage;
        this.estimatedDelivery = estimatedDelivery;
        this.history = Array.isArray(history) ? history : [];
    }
}