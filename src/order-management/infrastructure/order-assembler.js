import { GarmentItem } from "../domain/model/garment-item.js";
import { Order } from "../domain/model/order.js";
import { customerCodeToGuid, customerGuidToCode } from "../../shared/infrastructure/customer-id-translator.js";

/** "2026-11-20" (backend DateOnly) as local midnight, so the day does not move with the time zone. */
function fromDateOnly(value) {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}

/** Local calendar day as "2026-11-20" (backend DateOnly). */
function toDateOnly(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

/** Customer codes (CL005) become the GUID the backend stores; GUIDs are sent as they are. */
function toBackendCustomerId(customerId) {
    return /^CL\d+$/.test(customerId) ? customerCodeToGuid(customerId) : customerId;
}

/**
 * Maps between the resources of the Order Management backend and Order aggregates.
 */
export class OrderAssembler {
    /**
     * @param {Object} resource - OrderResource of the backend.
     * @returns {Order}
     */
    toEntityFromResource(resource) {
        const items = (resource.items ?? []).map(
            (item) =>
                new GarmentItem({
                    id: item.id,
                    orderId: resource.id,
                    type: item.type,
                    quantity: item.quantity,
                    careInstructions: item.careInstructions ?? "",
                }),
        );
        return new Order({
            id: resource.id,
            customerId: customerGuidToCode(resource.customerId),
            laundryId: resource.laundryId,
            deliveryMethod: resource.deliveryMethod,
            serviceType: resource.serviceType,
            estimatedDeliveryDate: fromDateOnly(resource.estimatedDeliveryDate),
            specialCareInstructions: resource.specialCareInstructions ?? "",
            status: resource.status,
            createdAt: new Date(resource.createdAt),
            items,
        });
    }

    /**
     * CreateOrderResource of the backend: it assigns the id, the CREATED status and the creation date.
     * @param {Order} order
     * @returns {Object}
     */
    toResourceFromEntity(order) {
        return {
            customerId: toBackendCustomerId(order.customerId),
            laundryId: order.laundryId,
            deliveryMethod: order.deliveryMethod,
            serviceType: order.serviceType,
            estimatedDeliveryDate: toDateOnly(order.estimatedDeliveryDate),
            specialCareInstructions: order.specialCareInstructions || null,
            items: order.items.map((item) => this.toItemResourceFromEntity(item)),
        };
    }

    /**
     * AddGarmentItemResource of the backend.
     * @param {GarmentItem} item
     * @returns {Object}
     */
    toItemResourceFromEntity(item) {
        return {
            type: item.type,
            quantity: item.quantity,
            careInstructions: item.careInstructions || null,
        };
    }

    /**
     * @param {string} customerId - Customer code (CL005) or GUID.
     * @returns {string} The GUID the backend filters by.
     */
    toBackendCustomerId(customerId) {
        return toBackendCustomerId(customerId);
    }
}
