import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";
import { BaseRepository } from "../../shared/infrastructure/base-repository.js";
import { OrderAssembler } from "./order-assembler.js";

const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * REST adapter for the OrderRepository port.
 * @implements {import("../domain/model/order-repository.js").OrderRepository}
 */
export class OrderRepositoryImpl extends BaseRepository {
    /**
     * @param {Object} [params]
     * @param {BaseApi} [params.baseApi]
     * @param {string} [params.endpointPath] - Defaults to VITE_ORDERS_ENDPOINT_PATH.
     */
    constructor({ baseApi = new BaseApi(), endpointPath = ordersEndpointPath } = {}) {
        if (!endpointPath) {
            throw new Error("VITE_ORDERS_ENDPOINT_PATH is not defined in the .env files");
        }
        super({
            endpoint: new BaseEndpoint(baseApi, endpointPath),
            assembler: new OrderAssembler(),
        });
    }

    /**
     * @param {string} customerId
     * @returns {Promise<import("../domain/model/order.js").Order[]>}
     */
    async findByCustomer(customerId) {
        const response = await this.endpoint.http.get(this.endpoint.endpointPath, {
            params: { customerId },
        });
        return response.data.map((resource) => this.assembler.toEntityFromResource(resource));
    }
}
