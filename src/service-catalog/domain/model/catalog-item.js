import { ValidationError } from "../../../shared/domain/model/errors.js";

/**
 * Base class for the priced items the laundry offers (services and garments).
 * Abstract: each subclass sets the code prefix (S104, P104...).
 */
export class CatalogItem {
    #id;
    #name;
    #category;
    #basePrice;
    #estimatedHours;
    #active;

    /**
     * @param {string} prefix - Code prefix of the subclass.
     * @param {Object} params
     * @param {string} params.id - Code such as S104 or P104.
     * @param {string} params.name
     * @param {string} params.category
     * @param {number} params.basePrice - Soles, zero or more.
     * @param {number} params.estimatedHours - Whole hours, at least 1.
     * @param {boolean} [params.active]
     */
    constructor(prefix, { id, name, category, basePrice, estimatedHours, active = true }) {
        if (new.target === CatalogItem) {
            throw new TypeError("CatalogItem is abstract and cannot be instantiated directly");
        }
        if (typeof id !== "string" || !new RegExp(`^${prefix}\\d{3,}$`).test(id)) {
            throw new ValidationError(`${new.target.name} id must follow the ${prefix}000 format`);
        }
        if (typeof name !== "string" || name.trim() === "") {
            throw new ValidationError(`${new.target.name} name must not be empty`);
        }
        if (typeof category !== "string" || category.trim() === "") {
            throw new ValidationError(`${new.target.name} category must not be empty`);
        }
        if (typeof basePrice !== "number" || !Number.isFinite(basePrice) || basePrice < 0) {
            throw new ValidationError(`${new.target.name} base price must be zero or more`);
        }
        if (!Number.isInteger(estimatedHours) || estimatedHours < 1) {
            throw new ValidationError(`${new.target.name} estimated time must be at least 1 hour`);
        }
        this.#id = id;
        this.#name = name.trim();
        this.#category = category.trim();
        this.#basePrice = Math.round(basePrice * 100) / 100;
        this.#estimatedHours = estimatedHours;
        this.#active = Boolean(active);
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get category() {
        return this.#category;
    }

    get basePrice() {
        return this.#basePrice;
    }

    get estimatedHours() {
        return this.#estimatedHours;
    }

    get active() {
        return this.#active;
    }
}
