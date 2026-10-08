import { ValidationError } from "./errors.js";
import { generateUuid, validateUuid } from "./uuid.js";

/**
 * Value object: base for domain events.
 */
export class DomainEvent {
    #eventId;
    #occurredAt;

    /**
     * @param {Object} [params]
     * @param {string} [params.eventId] - UUID; generated when omitted.
     * @param {Date} [params.occurredAt] - Defaults to now.
     */
    constructor({ eventId = generateUuid(), occurredAt = new Date() } = {}) {
        if (!validateUuid(eventId)) {
            throw new ValidationError("Event id must be a valid UUID");
        }
        if (!(occurredAt instanceof Date) || Number.isNaN(occurredAt.getTime())) {
            throw new ValidationError("Event occurredAt must be a valid date");
        }
        this.#eventId = eventId;
        this.#occurredAt = occurredAt;
    }

    /** @returns {string} */
    get eventId() {
        return this.#eventId;
    }

    /** @returns {Date} */
    get occurredAt() {
        return new Date(this.#occurredAt);
    }
}
