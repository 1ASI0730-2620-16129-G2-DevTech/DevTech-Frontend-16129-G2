import { CatalogItem } from "./catalog-item.js";

/**
 * Service offered by the laundry (Lavado Estándar, Planchado...). Code prefix S.
 * orderServiceType links it to the service type stored on Order Management orders,
 * so the demand chart can count how often it is requested.
 */
export class LaundryService extends CatalogItem {
    static PREFIX = "S";
    #orderServiceType;

    /**
     * @param {Object} params - See CatalogItem.
     * @param {string|null} [params.orderServiceType] - e.g. WASHING; null when orders cannot request it yet.
     */
    constructor({ orderServiceType = null, ...params }) {
        super(LaundryService.PREFIX, params);
        this.#orderServiceType = orderServiceType;
        Object.freeze(this);
    }

    get orderServiceType() {
        return this.#orderServiceType;
    }

    /**
     * @param {{serviceType: string}} order
     * @returns {number} 1 when the order requested this service, 0 otherwise.
     */
    demandIn(order) {
        return this.#orderServiceType && order.serviceType === this.#orderServiceType ? 1 : 0;
    }
}
