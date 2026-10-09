import { UserRepository } from "../domain/model/user-repository.js";
import { AuthenticationApi } from "./authentication-api.js";
import { UserAssembler } from "./user-assembler.js";

/**
 * REST adapter for the UserRepository port.
 * @implements {UserRepository}
 */
export class UserRepositoryImpl extends UserRepository {
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
     * @param {string} id
     * @returns {Promise<import("../domain/model/user.js").User|null>}
     */
    async findById(id) {
        const resource = await this.#api.getByIamId(id);
        if (resource) {
            return this.#assembler.toEntityFromResource(resource);
        }

        const response = await this.#api.getUsers();
        const resourceByLegacyId = response.data.find(
            (candidate) => this.#assembler.toEntityFromResource(candidate).id === id,
        );
        return resourceByLegacyId ? this.#assembler.toEntityFromResource(resourceByLegacyId) : null;
    }

    /**
     * @param {string} email
     * @returns {Promise<import("../domain/model/user.js").User|null>}
     */
    async findByEmail(email) {
        const response = await this.#api.getUsers({ email: email.trim().toLowerCase() });
        const resource = response.data[0];
        return resource ? this.#assembler.toEntityFromResource(resource) : null;
    }

    /**
     * @param {import("../domain/model/user.js").User} user
     * @param {{username: string, password: string}} credentials
     * @returns {Promise<import("../domain/model/user.js").User>}
     */
    async save(user, credentials) {
        const code = await this.#api.getNextUserCode(user.role === "customer" ? "CL" : "VN");
        const response = await this.#api.createUser(
            this.#assembler.toResourceFromEntity(user, credentials, code),
        );
        return this.#assembler.toEntityFromResource(response.data);
    }

    async update() {
        throw new Error("UserRepository.update is not supported by the mock identity flow");
    }

    async delete() {
        throw new Error("UserRepository.delete is not supported by the mock identity flow");
    }
}
