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

    /**
     * Creates a user.
     * @param {Object} params
     * @param {string} [params.id] - UUID; generated when omitted.
     * @param {string} params.email
     * @param {string} [params.passwordHash] - Present only when supplied by the authentication backend.
     * @param {string} params.role
     */
    constructor({ id = generateUuid(), email, passwordHash, role }) {
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
}
