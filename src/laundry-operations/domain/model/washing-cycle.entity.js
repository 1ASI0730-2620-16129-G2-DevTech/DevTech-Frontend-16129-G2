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

    /**
     * Checks if this cycle can be used for a garment item.
     * @param {{type: string}} item - The garment item (from the Order Management context).
     * @returns {boolean} True if the garment type matches the compatible type.
     */
    isCompatible(item) {
        const type = String(item?.type ?? '').trim().toLowerCase();
        return type !== '' && type === String(this.compatibleType).trim().toLowerCase();
    }
}
