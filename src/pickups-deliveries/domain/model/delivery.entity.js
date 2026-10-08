/**
 * Kinds of movement handled by the Pickups & Deliveries bounded context.
 * Each value has a translation under `deliveries.types.<value>`.
 */
export const DeliveryType = Object.freeze({
    PICKUP: 'pickup',
    DELIVERY: 'delivery'
});

/**
 * Lifecycle states of a pickup or delivery.
 * Each value has a translation under `deliveries.status.<value>`.
 */
export const DeliveryStatus = Object.freeze({
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
});

/**
 * Delivery aggregate of the Pickups & Deliveries bounded context.
 * A pickup of dirty garments from a customer, or a delivery of clean garments back to them.
 */
export class Delivery {
    /**
     * @param {Object} props
     * @param {number|null} props.id - Delivery identifier.
     * @param {number|null} props.orderId - Identifier of the order the movement belongs to.
     * @param {string} props.type - One of the DeliveryType values.
     * @param {string} props.customerName - Full name of the customer.
     * @param {string} props.address - Address where the movement takes place.
     * @param {string} props.driverName - Assigned driver, empty while unassigned.
     * @param {string} props.status - One of the DeliveryStatus values.
     * @param {string} props.scheduledAt - Scheduled date and time (ISO string).
     */
    constructor({
                    id = null,
                    orderId = null,
                    type = DeliveryType.DELIVERY,
                    customerName = '',
                    address = '',
                    driverName = '',
                    status = DeliveryStatus.SCHEDULED,
                    scheduledAt = ''
                }) {
        this.id = id;
        this.orderId = orderId;
        this.type = type;
        this.customerName = customerName;
        this.address = address;
        this.driverName = driverName;
        this.status = status;
        this.scheduledAt = scheduledAt;
    }
}