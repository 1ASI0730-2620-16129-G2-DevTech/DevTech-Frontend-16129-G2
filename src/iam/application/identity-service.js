import { NotFoundError, ValidationError } from "../../shared/domain/model/errors.js";
import { User } from "../domain/model/user.js";

/**
 * Application service coordinating identity use cases.
 */
export class IdentityService {
    #userRepository;
    #authenticationService;

    /**
     * @param {Object} params
     * @param {import("../domain/model/user-repository.js").UserRepository} params.userRepository
     * @param {import("./authentication-service.js").AuthenticationService} params.authenticationService
     */
    constructor({ userRepository, authenticationService }) {
        this.#userRepository = userRepository;
        this.#authenticationService = authenticationService;
    }

    /**
     * @param {string} email
     * @param {string} password
     * @returns {Promise<User|null>}
     */
    async authenticate(email, password) {
        return this.#authenticationService.authenticate(email, password);
    }

    /**
     * @param {Object} request
     * @param {string} request.username
     * @param {string} request.email
     * @param {string} request.password
     * @returns {Promise<User>}
     */
    async register({ username, email, password }) {
        if (typeof username !== "string" || username.trim() === "") {
            throw new ValidationError("Username must not be empty");
        }
        if (typeof password !== "string" || password.length < 6) {
            throw new ValidationError("Password must contain at least 6 characters");
        }

        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
        const user = new User({
            email: normalizedEmail,
            role: "customer",
        });
        if (await this.#userRepository.findByEmail(user.email)) {
            throw new Error("EMAIL_ALREADY_REGISTERED");
        }

        return this.#userRepository.save(user, {
            username: username.trim(),
            password,
        });
    }

    /**
     * @param {string} id
     * @returns {Promise<User>}
     * @throws {NotFoundError}
     */
    async getUserById(id) {
        const user = await this.#userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User ${id} not found`);
        }
        return user;
    }
}
