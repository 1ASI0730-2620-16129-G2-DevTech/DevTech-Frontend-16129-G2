import {WashingCycle} from "@/laundry-operations/domain/model/washing-cycle.entity.js";

export class WashingCycleAssembler {
    static toEntityFromResource(resource) {
        return new WashingCycle({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['washingCycles'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
