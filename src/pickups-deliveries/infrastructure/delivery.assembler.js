import {Delivery} from "@/pickups-deliveries/domain/model/delivery.entity.js";

export class DeliveryAssembler {
    static toEntityFromResource(resource) {
        return new Delivery({...resource});
    }

    /** The id is left out while it is null, so the API assigns it. */
    static toResourceFromEntity(entity) {
        const resource = {
            orderId: entity.orderId,
            type: entity.type,
            customerName: entity.customerName,
            address: entity.address,
            driverName: entity.driverName,
            status: entity.status,
            scheduledAt: entity.scheduledAt
        };
        return entity.id === null ? resource : {id: entity.id, ...resource};
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['deliveries'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}