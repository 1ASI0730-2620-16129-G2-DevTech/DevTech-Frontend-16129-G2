import {OrderTracking} from "@/tracking-notifications/domain/model/order-tracking.entity.js";

export class TrackingAssembler {
    static toEntityFromResource(resource) {
        return new OrderTracking({...resource});
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