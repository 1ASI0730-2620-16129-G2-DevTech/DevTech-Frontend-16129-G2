import { ValidationError } from "./errors.js";
import { validateUuid } from "./uuid.js";

/**
 * Base class for aggregate roots. Holds the aggregate identity.
 * Abstract: it cannot be instantiated directly.
 */
export class AggregateRoot {
    #id;

    /**
     * @param {string} id - UUID of the aggregate.
     * @throws {ValidationError} If the id is not a valid UUID.
     */
    constructor(id) {
        if (new.target === AggregateRoot) {
            throw new TypeError("AggregateRoot is abstract and cannot be instantiated directly");
        }
        if (!validateUuid(id)) {
            throw new ValidationError("Aggregate id must be a valid UUID");
        }
        this.#id = id;
    }

    /** @returns {string} */
    get id() {
        return this.#id;
    }
}
