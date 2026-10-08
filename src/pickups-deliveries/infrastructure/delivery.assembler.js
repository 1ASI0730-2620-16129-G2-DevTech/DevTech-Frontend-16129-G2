import {Delivery} from "@/pickups-deliveries/domain/model/delivery.entity.js";

export class DeliveryAssembler {
    static toEntityFromResource(resource) {
        return new Delivery({...resource});
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