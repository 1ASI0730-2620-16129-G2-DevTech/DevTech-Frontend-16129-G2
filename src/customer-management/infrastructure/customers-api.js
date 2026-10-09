import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH ?? "/users";

export class CustomersApi extends BaseApi {
    #customersEndpoint;

    constructor() {
        super();
        if (!customersEndpointPath) {
            throw new Error("VITE_CUSTOMERS_ENDPOINT_PATH is not defined in the .env files");
        }
        this.#customersEndpoint = new BaseEndpoint(this, customersEndpointPath);
    }

    getCustomers() {
        return this.#customersEndpoint.getAll();
    }

    createCustomer(resource) {
        return this.#customersEndpoint.create(resource);
    }

    /**
     * Returns the next free CL code. Customer accounts created through IAM
     * registration also use CL codes, so the users collection is checked too.
     * @returns {Promise<string>}
     */
    async getNextCustomerCode() {
        const responses = await Promise.all([this.getCustomers(), this.http.get(usersEndpointPath)]);
        const highest = responses
            .flatMap((response) => response.data)
            .map((resource) => /^CL(\d+)$/.exec(String(resource.id))?.[1])
            .filter(Boolean)
            .reduce((max, digits) => Math.max(max, Number(digits)), 0);
        return `CL${String(highest + 1).padStart(3, "0")}`;
    }
}
