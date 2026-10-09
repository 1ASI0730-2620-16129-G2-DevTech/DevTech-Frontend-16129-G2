import {LaundryOrder} from "@/laundry-operations/domain/model/laundry-order.entity.js";

export class LaundryOrderAssembler {
    static toEntityFromResource(resource) {
        return new LaundryOrder({...resource});
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            orderId: entity.orderId,
            currentStage: entity.currentStage,
            priority: entity.priority,
            washingCycleId: entity.washingCycleId,
            resourceId: entity.resourceId,
            expectedCompletion: entity.expectedCompletion ? entity.expectedCompletion.toISOString() : null
        };
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['laundryOrders'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
