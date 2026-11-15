import {LaundryResource} from "@/laundry-operations/domain/model/laundry-resource.entity.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";

/** The backend sends EResourceStatus as a number: its position in the enum. */
const BACKEND_STATUSES = Object.freeze([ResourceStatus.AVAILABLE, ResourceStatus.BUSY, ResourceStatus.MAINTENANCE]);

export class LaundryResourceAssembler {
    static toEntityFromResource(resource) {
        return new LaundryResource({
            id: resource.id,
            laundryId: resource.laundryId,
            name: resource.name,
            status: typeof resource.status === "number" ? BACKEND_STATUSES[resource.status] : resource.status,
            capacity: resource.capacity,
            assignedOrderId: resource.assignedOrderId ?? null
        });
    }

    /** SynchronizeResourceResource of the backend. */
    static toStatusResource(status) {
        const index = BACKEND_STATUSES.indexOf(status);
        if (index === -1) throw new Error(`Unknown resource status: ${status}`);
        return {status: index};
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
