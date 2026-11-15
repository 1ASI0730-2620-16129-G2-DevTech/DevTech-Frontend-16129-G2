import {Delivery, DeliveryStatus, DeliveryType} from "@/pickups-deliveries/domain/model/delivery.entity.js";

/** Backend names (ServiceType and PickupDeliveryStatus) to the values of the web app. */
const TYPE_FROM_RESOURCE = Object.freeze({Pickup: DeliveryType.PICKUP, Delivery: DeliveryType.DELIVERY});
const TYPE_TO_RESOURCE = Object.freeze({[DeliveryType.PICKUP]: "Pickup", [DeliveryType.DELIVERY]: "Delivery"});
const STATUS_FROM_RESOURCE = Object.freeze({
    Scheduled: DeliveryStatus.SCHEDULED,
    InTransit: DeliveryStatus.IN_TRANSIT,
    Completed: DeliveryStatus.COMPLETED,
    Failed: DeliveryStatus.FAILED
});

const DEFAULT_CITY = "Lima";

/**
 * Splits "Jr. Puno 029, Breña" into street and city (the part after the last comma).
 * @param {string} address
 * @returns {{street: string, city: string}}
 */
function splitAddress(address) {
    const text = String(address ?? "").trim();
    const comma = text.lastIndexOf(",");
    if (comma === -1) return {street: text, city: DEFAULT_CITY};
    return {street: text.slice(0, comma).trim(), city: text.slice(comma + 1).trim() || DEFAULT_CITY};
}

export class DeliveryAssembler {
    /**
     * @param {Object} resource - PickupDeliveryResource of the backend.
     * @param {Object} [context] - Data the backend does not keep with the pickup or delivery.
     * @param {string} [context.customerName] - From the customer of the order.
     * @param {string} [context.scheduledAt] - Estimated delivery date of the order (ISO string).
     * @returns {Delivery}
     */
    static toEntityFromResource(resource, {customerName = "", scheduledAt = ""} = {}) {
        return new Delivery({
            id: resource.id,
            orderId: resource.orderId,
            type: TYPE_FROM_RESOURCE[resource.type] ?? String(resource.type).toLowerCase(),
            customerName,
            address: [resource.street, resource.city].filter(Boolean).join(", "),
            status: STATUS_FROM_RESOURCE[resource.status] ?? String(resource.status).toLowerCase(),
            scheduledAt
        });
    }

    /**
     * SchedulePickupDeliveryResource of the backend.
     * @param {Delivery} entity
     * @returns {Object}
     */
    static toScheduleResource(entity) {
        const {street, city} = splitAddress(entity.address);
        return {
            orderId: entity.orderId,
            street,
            city,
            type: TYPE_TO_RESOURCE[entity.type]
        };
    }
}
