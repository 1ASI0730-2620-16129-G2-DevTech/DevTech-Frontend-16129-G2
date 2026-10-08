import { AuthenticationService } from "../application/authentication-service.js";
import { AuthenticationApi } from "./authentication-api.js";
import { UserAssembler } from "./user-assembler.js";

/**
 * REST adapter for the AuthenticationService port.
 * @implements {AuthenticationService}
 */
export class AuthenticationServiceImpl extends AuthenticationService {
    #api;
    #assembler;

    /**
     * @param {Object} [params]
     * @param {AuthenticationApi} [params.api]
     */
    constructor({ api = new AuthenticationApi() } = {}) {
        super();
        this.#api = api;
        this.#assembler = new UserAssembler();
    }

    /**
     * @param {string} email
     * @param {string} password
     * @returns {Promise<import("../domain/model/user.js").User|null>}
     */
    async authenticate(email, password) {
        const resource = await this.#api.authenticate(email, password);
        return resource ? this.#assembler.toEntityFromResource(resource) : null;
    }
}
