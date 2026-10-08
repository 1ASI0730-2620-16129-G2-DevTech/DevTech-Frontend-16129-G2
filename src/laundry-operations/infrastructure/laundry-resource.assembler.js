import {LaundryResource} from "@/laundry-operations/domain/model/laundry-resource.entity.js";

export class LaundryResourceAssembler {
    static toEntityFromResource(resource) {
        return new LaundryResource({...resource});
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            laundryId: entity.laundryId,
            name: entity.name,
            status: entity.status,
            capacity: entity.capacity
        };
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['laundryResources'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
