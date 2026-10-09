import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH ?? "/users";
const customersEndpointPath = import.meta.env.VITE_ORDER_CUSTOMERS_ENDPOINT_PATH;

export class AuthenticationApi extends BaseApi {
    #usersEndpoint;

    constructor({ endpointPath = usersEndpointPath } = {}) {
        super();
        if (!endpointPath) {
            throw new Error("VITE_USERS_ENDPOINT_PATH is not defined in the .env files");
        }
        this.#usersEndpoint = new BaseEndpoint(this, endpointPath);
    }

    getUsers(params = {}) {
        return this.#usersEndpoint.http.get(this.#usersEndpoint.endpointPath, { params });
    }

    async authenticate(email, password) {
        const response = await this.getUsers({
            email: email.trim().toLowerCase(),
            password,
        });
        return response.data[0] ?? null;
    }

    async getByIamId(id) {
        const response = await this.getUsers({ iamId: id });
        return response.data[0] ?? null;
    }

    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    /**
     * Returns the next free mock code for a prefix (CL for customers, VN for managers).
     * Customer codes are shared with the customers collection, so it is checked too.
     * @param {"CL"|"VN"} prefix
     * @returns {Promise<string>}
     */
    async getNextUserCode(prefix) {
        const paths = [this.#usersEndpoint.endpointPath];
        if (prefix === "CL" && customersEndpointPath) {
            paths.push(customersEndpointPath);
        }
        const responses = await Promise.all(paths.map((path) => this.http.get(path)));
        const pattern = new RegExp(`^${prefix}(\\d+)$`);
        const highest = responses
            .flatMap((response) => response.data)
            .map((resource) => pattern.exec(String(resource.id))?.[1])
            .filter(Boolean)
            .reduce((max, digits) => Math.max(max, Number(digits)), 0);
        return `${prefix}${String(highest + 1).padStart(3, "0")}`;
    }
}
