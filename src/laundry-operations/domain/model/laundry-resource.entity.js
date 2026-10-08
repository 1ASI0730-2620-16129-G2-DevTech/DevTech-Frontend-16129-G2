import {ValidationError} from "@/shared/domain/model/errors.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";

/**
 * Physical resource of a laundry (e.g., a washing machine or a dryer).
 */
export class LaundryResource {
    constructor({id = null, laundryId = null, name = '', status = ResourceStatus.AVAILABLE, capacity = 0} = {}) {
        if (!Object.values(ResourceStatus).includes(status)) {
            throw new ValidationError(`Invalid resource status: ${status}`);
        }
        if (!Number.isInteger(capacity) || capacity < 0) {
            throw new ValidationError("Capacity must be a non-negative integer");
        }
        this.id = id;
        this.laundryId = laundryId;
        this.name = name;
        this.status = status;
        this.capacity = capacity;
    }

    isAvailable() {
        return this.status === ResourceStatus.AVAILABLE;
    }

    /** Marks the resource as busy. */
    assign() {
        if (!this.isAvailable()) {
            throw new ValidationError(`Resource "${this.name}" is not available`);
        }
        this.status = ResourceStatus.BUSY;
    }

    /** Marks the resource as available again. */
    release() {
        if (this.status !== ResourceStatus.BUSY) {
            throw new ValidationError(`Resource "${this.name}" is not busy`);
        }
        this.status = ResourceStatus.AVAILABLE;
    }
}
