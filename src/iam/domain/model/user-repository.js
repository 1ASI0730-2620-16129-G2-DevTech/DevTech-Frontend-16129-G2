/**
 * Port for persisting and retrieving IAM users.
 */
export class UserRepository {
    /**
     * Finds a user by email.
     * @param {string} email
     * @returns {Promise<import('./user.js').User|null>}
     */
    async findByEmail(email) {
        throw new Error('UserRepository.findByEmail must be implemented');
    }
}
