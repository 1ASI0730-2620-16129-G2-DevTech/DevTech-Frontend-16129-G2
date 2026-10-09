import { ValidationError } from "../../../shared/domain/model/errors.js";
import { validateUuid } from "../../../shared/domain/model/uuid.js";

/**
 * Customer as seen by the Order Management context: just enough to
 * identify who places an order.
 */
export class Customer {
    #id;
    #fullName;
    #documentNumber;

    /**
     * @param {Object} params
     * @param {string} params.id - UUID.
     * @param {string} params.fullName
     * @param {string} [params.documentNumber]
     */
    constructor({ id, fullName, documentNumber = "" }) {
        if (!validateUuid(id)) {
            throw new ValidationError("Customer id must be a valid UUID");
        }
        if (typeof fullName !== "string" || fullName.trim() === "") {
            throw new ValidationError("Customer full name must not be empty");
        }
        this.#id = id;
        this.#fullName = fullName.trim();
        this.#documentNumber = String(documentNumber).trim();
        Object.freeze(this);
    }

    get id() {
        return this.#id;
    }

    get fullName() {
        return this.#fullName;
    }

    get documentNumber() {
        return this.#documentNumber;
    }

    /**
     * @param {string} query
     * @returns {boolean} True when the name or the document contains the query (ignoring case and accents).
     */
    matches(query) {
        const normalized = normalize(query);
        return normalize(this.#fullName).includes(normalized) || this.#documentNumber.includes(normalized);
    }
}

function normalize(text) {
    return text.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
