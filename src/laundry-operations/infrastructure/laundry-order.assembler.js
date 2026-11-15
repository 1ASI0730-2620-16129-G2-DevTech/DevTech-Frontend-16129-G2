import {LaundryOrder} from "@/laundry-operations/domain/model/laundry-order.entity.js";
import {ProcessingStage} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";

/** The backend sends its enums as numbers: position in EProcessingStage and EPriority. */
const BACKEND_STAGES = Object.freeze([
    ProcessingStage.RECEPTION,
    ProcessingStage.CLASSIFICATION,
    ProcessingStage.WASHING,
    ProcessingStage.DRYING_IRONING,
    ProcessingStage.PACKAGING,
    ProcessingStage.READY
]);
const BACKEND_PRIORITIES = Object.freeze([Priority.NORMAL, Priority.VIP]);

function fromBackendEnum(values, value) {
    return typeof value === "number" ? values[value] : value;
}

function toBackendEnum(values, value) {
    const index = values.indexOf(value);
    if (index === -1) throw new Error(`Unknown value for the backend: ${value}`);
    return index;
}

export class LaundryOrderAssembler {
    static toEntityFromResource(resource) {
        return new LaundryOrder({
            id: resource.id,
            orderId: resource.orderId,
            laundryId: resource.laundryId,
            currentStage: fromBackendEnum(BACKEND_STAGES, resource.currentStage),
            priority: fromBackendEnum(BACKEND_PRIORITIES, resource.priority),
            washingCycleId: resource.washingCycleId,
            resourceId: resource.resourceId,
            expectedCompletion: resource.expectedCompletion
        });
    }

    /** ReceiveLaundryOrderResource of the backend. */
    static toReceiveResource({orderId, laundryId, priority = Priority.NORMAL, expectedCompletion = null}) {
        return {
            orderId,
            laundryId,
            priority: toBackendEnum(BACKEND_PRIORITIES, priority),
            expectedCompletion: expectedCompletion ? new Date(expectedCompletion).toISOString() : null
        };
    }

    /** PrioritizeLaundryOrderResource of the backend. */
    static toPriorityResource(priority) {
        return {priority: toBackendEnum(BACKEND_PRIORITIES, priority)};
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
