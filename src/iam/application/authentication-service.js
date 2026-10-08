/**
 * Port for authenticating a user with the configured authentication provider.
 */
export class AuthenticationService {
    /**
     * @param {string} email
     * @param {string} password
     * @returns {Promise<import("../domain/model/user.js").User|null>}
     */
    async authenticate(email, password) {
        throw new Error("AuthenticationService.authenticate must be implemented");
    }
}
