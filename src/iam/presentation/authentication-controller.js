import { User } from "../domain/model/user.js";

/**
 * Presentation boundary for identity use cases.
 * Converts plain requests and aggregate results to UI-safe objects.
 */
export class AuthenticationController {
    #identityService;

    /**
     * @param {Object} params
     * @param {import("../application/identity-service.js").IdentityService} params.identityService
     */
    constructor({ identityService }) {
        this.#identityService = identityService;
    }

    /**
     * @param {{email: string, password: string}} request
     * @returns {Promise<{id: string, email: string, role: string}|null>}
     */
    async signIn({ email, password }) {
        const user = await this.#identityService.authenticate(email, password);
        return user ? toResponse(user) : null;
    }

    /**
     * @param {{username: string, email: string, password: string}} request
     * @returns {Promise<{id: string, email: string, role: string}>}
     */
    async signUp(request) {
        return toResponse(await this.#identityService.register(request));
    }

    /**
     * @param {string} id
     * @returns {Promise<{id: string, email: string, role: string}>}
     */
    async getUserById(id) {
        return toResponse(await this.#identityService.getUserById(id));
    }
}

/**
 * @param {User} user
 * @returns {{id: string, email: string, role: string}}
 */
function toResponse(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
    };
}
