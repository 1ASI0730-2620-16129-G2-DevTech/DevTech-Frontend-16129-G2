import { CatalogItem } from "./catalog-item.js";

/**
 * Garment the laundry accepts (Camisa, Pantalón...). Code prefix P.
 */
export class Garment extends CatalogItem {
    static PREFIX = "P";

    /** @param {Object} params - See CatalogItem. */
    constructor(params) {
        super(Garment.PREFIX, params);
        Object.freeze(this);
    }

    /**
     * @param {{items: {type: string, quantity: number}[]}} order
     * @returns {number} Units of this garment in the order, matched by name ignoring case and accents.
     */
    demandIn(order) {
        const name = normalize(this.name);
        return (order.items ?? [])
            .filter((item) => normalize(item.type) === name)
            .reduce((total, item) => total + item.quantity, 0);
    }
}

function normalize(text) {
    return String(text).trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
