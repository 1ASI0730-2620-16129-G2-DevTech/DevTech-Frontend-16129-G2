import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH ?? "/users";

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
}
