/**
 * Port for persisting and retrieving IAM users.
 */
export class UserRepository {
    /**
     * @param {string} id - Domain UUID.
     * @returns {Promise<import('./user.js').User|null>}
     */
    async findById(id) {
        throw new Error('UserRepository.findById must be implemented');
    }

    /**
     * Finds a user by email.
     * @param {string} email
     * @returns {Promise<import('./user.js').User|null>}
     */
    async findByEmail(email) {
        throw new Error('UserRepository.findByEmail must be implemented');
    }

    /**
     * Persists a user with mock authentication credentials.
     * @param {import('./user.js').User} user
     * @param {{username: string, password: string}} credentials
     * @returns {Promise<import('./user.js').User>}
     */
    async save(user, credentials) {
        throw new Error('UserRepository.save must be implemented');
    }
}
