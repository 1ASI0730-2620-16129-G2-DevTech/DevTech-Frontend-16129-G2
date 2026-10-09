import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";
import { CustomerAssembler } from "./customer-assembler.js";

const customersEndpointPath = import.meta.env.VITE_ORDER_CUSTOMERS_ENDPOINT_PATH;

/**
 * REST adapter for the CustomerRepository port.
 * @implements {import("../domain/model/customer-repository.js").CustomerRepository}
 */
export class CustomerRepositoryImpl {
    #endpoint;
    #assembler = new CustomerAssembler();

    /**
     * @param {Object} [params]
     * @param {BaseApi} [params.baseApi]
     * @param {string} [params.endpointPath] - Defaults to VITE_ORDER_CUSTOMERS_ENDPOINT_PATH.
     */
    constructor({ baseApi = new BaseApi(), endpointPath = customersEndpointPath } = {}) {
        if (!endpointPath) {
            throw new Error("VITE_ORDER_CUSTOMERS_ENDPOINT_PATH is not defined in the .env files");
        }
        this.#endpoint = new BaseEndpoint(baseApi, endpointPath);
    }

    async findAll() {
        const response = await this.#endpoint.getAll();
        return response.data.map((resource) => this.#assembler.toEntityFromResource(resource));
    }
}
