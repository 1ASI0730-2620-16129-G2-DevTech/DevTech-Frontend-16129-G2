import { ValidationError } from "../../../shared/domain/model/errors.js";

/**
 * @param {*} value
 * @returns {boolean} True when value is a customer code such as CL001.
 */
export function isValidCustomerId(value) {
    return typeof value === "string" && /^CL\d{3,}$/.test(value);
}

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
     * @param {string} params.id - Customer code, e.g. CL001.
     * @param {string} params.fullName
     * @param {string} [params.documentNumber]
     */
    constructor({ id, fullName, documentNumber = "" }) {
        if (!isValidCustomerId(id)) {
            throw new ValidationError("Customer id must follow the CL000 format");
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
