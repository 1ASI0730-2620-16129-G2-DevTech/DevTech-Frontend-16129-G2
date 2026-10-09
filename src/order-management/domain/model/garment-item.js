import { ValidationError } from "../../../shared/domain/model/errors.js";
import { generateUuid, validateUuid } from "../../../shared/domain/model/uuid.js";

/**
 * Entity representing a garment type inside an order.
 */
export class GarmentItem {
    #id;
    #orderId;
    #type;
    #quantity;
    #careInstructions;

    /**
     * @param {Object} params
     * @param {string} [params.id] - UUID; generated when omitted.
     * @param {string} params.orderId - UUID of the owning order.
     * @param {string} params.type
     * @param {number} params.quantity - Positive integer.
     * @param {string} [params.careInstructions]
     */
    constructor({ id = generateUuid(), orderId, type, quantity, careInstructions = "" }) {
        if (!validateUuid(id)) {
            throw new ValidationError("GarmentItem id must be a valid UUID");
        }
        if (!validateUuid(orderId)) {
            throw new ValidationError("GarmentItem orderId must be a valid UUID");
        }
        if (typeof type !== "string" || type.trim() === "") {
            throw new ValidationError("GarmentItem type must not be empty");
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new ValidationError("GarmentItem quantity must be a positive integer");
        }
        if (typeof careInstructions !== "string") {
            throw new ValidationError("GarmentItem care instructions must be a string");
        }

        this.#id = id;
        this.#orderId = orderId;
        this.#type = type.trim();
        this.#quantity = quantity;
        this.#careInstructions = careInstructions.trim();
        Object.freeze(this);
    }

    get id() {
        return this.#id;
    }

    get orderId() {
        return this.#orderId;
    }

    get type() {
        return this.#type;
    }

    get quantity() {
        return this.#quantity;
    }

    get careInstructions() {
        return this.#careInstructions;
    }
}
