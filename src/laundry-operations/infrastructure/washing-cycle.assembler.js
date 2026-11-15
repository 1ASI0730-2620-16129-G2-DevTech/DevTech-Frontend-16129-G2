import {WashingCycle} from "@/laundry-operations/domain/model/washing-cycle.entity.js";

export class WashingCycleAssembler {
    static toEntityFromResource(resource) {
        return new WashingCycle({...resource});
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
