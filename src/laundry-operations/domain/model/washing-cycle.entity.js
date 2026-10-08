import {ValidationError} from "@/shared/domain/model/errors.js";

/**
 * Washing cycle that can be assigned to a laundry order.
 */
export class WashingCycle {
    constructor({id = null, name = '', durationMinutes = 0, compatibleType = ''} = {}) {
        if (!Number.isInteger(durationMinutes) || durationMinutes < 0) {
            throw new ValidationError("Duration must be a non-negative integer (minutes)");
        }
        this.id = id;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.compatibleType = compatibleType;
    }
}
