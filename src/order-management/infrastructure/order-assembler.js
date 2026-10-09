import { GarmentItem } from "../domain/model/garment-item.js";
import { Order } from "../domain/model/order.js";

/**
 * Maps between API resources (plain JSON) and Order aggregates.
 */
export class OrderAssembler {
    /**
     * @param {Object} resource
     * @returns {Order}
     */
    toEntityFromResource(resource) {
        const items = (resource.items ?? []).map(
            (item) =>
                new GarmentItem({
                    id: item.id,
                    orderId: item.orderId ?? resource.id,
                    type: item.type,
                    quantity: item.quantity,
                    careInstructions: item.careInstructions,
                }),
        );
        return new Order({
            id: resource.id,
            customerId: resource.customerId,
            laundryId: resource.laundryId,
            deliveryMethod: resource.deliveryMethod,
            serviceType: resource.serviceType,
            estimatedDeliveryDate: new Date(resource.estimatedDeliveryDate),
            specialCareInstructions: resource.specialCareInstructions,
            status: resource.status,
            createdAt: new Date(resource.createdAt),
            items,
        });
    }

    /**
     * @param {Order} order
     * @returns {Object}
     */
    toResourceFromEntity(order) {
        return {
            id: order.id,
            customerId: order.customerId,
            laundryId: order.laundryId,
            status: order.status,
            deliveryMethod: order.deliveryMethod,
            serviceType: order.serviceType,
            estimatedDeliveryDate: order.estimatedDeliveryDate.toISOString(),
            specialCareInstructions: order.specialCareInstructions,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map((item) => ({
                id: item.id,
                orderId: item.orderId,
                type: item.type,
                quantity: item.quantity,
                careInstructions: item.careInstructions,
            })),
        };
    }
}
