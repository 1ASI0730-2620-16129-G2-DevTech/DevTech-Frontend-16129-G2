import { ValidationError } from '../../../shared/domain/model/errors.js';
import {generateUuid,validateUuid} from '../../../shared/domain/model/uuid.js';

/**
 * Aggregate root representing an IAM user.
 */
export class User {
    #id;
    #email;
    #passwordHash;
    #role;

    /**
     * Creates a user.
     * @param {Object} params
     * @param {string} [params.id] - UUID; generated when omitted.
     * @param {string} params.email
     * @param {string} params.passwordHash
     * @param {string} params.role
     */
    constructor({ id = generateUuid(), email, passwordHash, role }) {
        if (!validateUuid(id)) {
            throw new ValidationError('User id must be a valid UUID');
        }
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new ValidationError('User email must be valid');
        }
        if (typeof passwordHash !== 'string' || passwordHash.trim() === '') {
            throw new ValidationError('User password hash must not be empty');
        }
        if (typeof role !== 'string' || role.trim() === '') {
            throw new ValidationError('User role must not be empty');
        }

        this.#id = id;
        this.#email = email.trim().toLowerCase();
        this.#passwordHash = passwordHash;
        this.#role = role.trim();
        Object.freeze(this);
    }

    get id() {
        return this.#id;
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
