import {OrderTracking} from "@/tracking-notifications/domain/model/order-tracking.entity.js";

export class TrackingAssembler {
    static toEntityFromResource(resource) {
        return new OrderTracking({...resource});
    }

    /** The id is left out while it is null, so the API assigns it. */
    static toResourceFromEntity(entity) {
        const resource = {
            orderId: entity.orderId,
            customerName: entity.customerName,
            currentStage: entity.currentStage,
            estimatedDelivery: entity.estimatedDelivery,
            history: entity.history
        };
        return entity.id === null ? resource : {id: entity.id, ...resource};
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['tracking'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}