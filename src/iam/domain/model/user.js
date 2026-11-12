import { ValidationError } from '../../../shared/domain/model/errors.js';
import { generateUuid } from '../../../shared/domain/model/uuid.js';
import { AggregateRoot } from '../../../shared/domain/model/aggregate-root.js';

/**
 * Aggregate root representing an IAM user.
 */
export class User extends AggregateRoot {
    #email;
    #passwordHash;
    #role;
    #username;
    #code;

    /**
     * Creates a user.
     * @param {Object} params
     * @param {string} [params.id] - UUID; generated when omitted.
     * @param {string} params.email
     * @param {string} [params.passwordHash] - Present only when supplied by the authentication backend.
     * @param {string} params.role
     * @param {string} [params.username] - Name shown in the application (for example, in the sidebar).
     * @param {string} [params.code] - Business code shared with other contexts (CL001 customers, VN001 managers).
     */
    constructor({ id = generateUuid(), email, passwordHash, role, username = '', code = '' }) {
        super(id);
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new ValidationError('User email must be valid');
        }
        if (passwordHash !== undefined && (typeof passwordHash !== 'string' || passwordHash.trim() === '')) {
            throw new ValidationError('User password hash must not be empty');
        }
        if (typeof role !== 'string' || role.trim() === '') {
            throw new ValidationError('User role must not be empty');
        }

        this.#email = email.trim().toLowerCase();
        this.#passwordHash = passwordHash;
        this.#role = role.trim();
        this.#username = String(username ?? '').trim();
        this.#code = String(code ?? '').trim();
        Object.freeze(this);
    }

    get email() {
        return this.#email;
    }

    get passwordHash() {
        return this.#passwordHash;
    }

    get role() {
        return this.#role;
    }

    /** @returns {string} Name shown in the application; the email when no username was registered. */
    get username() {
        return this.#username || this.#email;
    }

    /** @returns {string} Business code, for example "CL001"; empty when the user has none. */
    get code() {
        return this.#code;
    }
}
