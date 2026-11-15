import { BackendApi, currentLaundryId } from "../../shared/infrastructure/backend-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";
import { BaseRepository } from "../../shared/infrastructure/base-repository.js";
import { NotFoundError } from "../../shared/domain/model/errors.js";
import { ORDER_STATUS_SEQUENCE } from "../domain/model/order-status.js";
import { OrderAssembler } from "./order-assembler.js";

const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * REST adapter for the OrderRepository port, on top of the Order Management backend.
 * The backend changes an order through specific operations (status, add item, remove item)
 * instead of replacing it, so save() and update() translate the aggregate into those calls.
 * @implements {import("../domain/model/order-repository.js").OrderRepository}
 */
export class OrderRepositoryImpl extends BaseRepository {
    #laundryId;

    /**
     * @param {Object} [params]
     * @param {BackendApi} [params.baseApi]
     * @param {string} [params.endpointPath] - Defaults to VITE_ORDERS_ENDPOINT_PATH.
     * @param {string} [params.laundryId] - Laundry whose orders findAll() returns; VITE_CURRENT_LAUNDRY_ID by default.
     */
    constructor({ baseApi = new BackendApi(), endpointPath = ordersEndpointPath, laundryId = currentLaundryId } = {}) {
        if (!endpointPath) {
            throw new Error("VITE_ORDERS_ENDPOINT_PATH is not defined in the .env files");
        }
        if (!laundryId) {
            throw new Error("VITE_CURRENT_LAUNDRY_ID is not defined in the .env files");
        }
        super({
            endpoint: new BaseEndpoint(baseApi, endpointPath),
            assembler: new OrderAssembler(),
        });
        this.#laundryId = laundryId;
    }

    get #http() {
        return this.endpoint.http;
    }

    get #path() {
        return this.endpoint.endpointPath;
    }

    #toEntities(response) {
        return response.data.map((resource) => this.assembler.toEntityFromResource(resource));
    }

    /**
     * The backend lists orders per laundry or per customer: "all" the orders are those of the current laundry.
     * @returns {Promise<import("../domain/model/order.js").Order[]>}
     */
    async findAll() {
        const response = await this.#http.get(this.#path, { params: { laundryId: this.#laundryId } });
        return this.#toEntities(response);
    }

    /**
     * @param {string} customerId - Customer code (CL005) or GUID.
     * @returns {Promise<import("../domain/model/order.js").Order[]>}
     */
    async findByCustomer(customerId) {
        const response = await this.#http.get(this.#path, {
            params: { customerId: this.assembler.toBackendCustomerId(customerId) },
        });
        return this.#toEntities(response);
    }

    /**
     * Creates the order (the backend assigns its id and starts it as CREATED) and then
     * walks it, one step at a time, up to the status the aggregate already has.
     * @param {import("../domain/model/order.js").Order} order
     * @returns {Promise<import("../domain/model/order.js").Order>} The order as stored by the backend.
     */
    async save(order) {
        const response = await this.endpoint.create(this.assembler.toResourceFromEntity(order));
        const created = this.assembler.toEntityFromResource(response.data);
        await this.#walkStatus(created.id, created.status, order.status);
        return created.status === order.status ? created : this.#getOrThrow(created.id);
    }

    /**
     * Applies the differences between the stored order and the given aggregate:
     * removed items, added (or edited) items and the new status.
     * @param {import("../domain/model/order.js").Order} order
     * @returns {Promise<import("../domain/model/order.js").Order>}
     */
    async update(order) {
        const stored = await this.#getOrThrow(order.id);
        const wanted = new Map(order.items.map((item) => [item.id, item]));
        const current = new Map(stored.items.map((item) => [item.id, item]));
        const sameItem = (a, b) =>
            a.type === b.type && a.quantity === b.quantity && a.careInstructions === b.careInstructions;

        for (const [itemId, item] of current) {
            const replacement = wanted.get(itemId);
            if (!replacement || !sameItem(item, replacement)) {
                await this.#http.delete(`${this.#path}/${order.id}/items/${itemId}`);
            }
        }
        for (const [itemId, item] of wanted) {
            const existing = current.get(itemId);
            if (!existing || !sameItem(existing, item)) {
                await this.#http.post(`${this.#path}/${order.id}/items`, this.assembler.toItemResourceFromEntity(item));
            }
        }
        await this.#walkStatus(order.id, stored.status, order.status);
        return this.#getOrThrow(order.id);
    }

    async #walkStatus(orderId, from, to) {
        const target = ORDER_STATUS_SEQUENCE.indexOf(to);
        for (let step = ORDER_STATUS_SEQUENCE.indexOf(from) + 1; step <= target; step++) {
            await this.#http.put(`${this.#path}/${orderId}/status`, { status: ORDER_STATUS_SEQUENCE[step] });
        }
    }

    async #getOrThrow(id) {
        const order = await this.findById(id);
        if (order === null) throw new NotFoundError(`Order ${id} not found`);
        return order;
    }
}
