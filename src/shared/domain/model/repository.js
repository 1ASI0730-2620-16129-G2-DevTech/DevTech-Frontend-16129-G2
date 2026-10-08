/**
 * Generic port for persisting and retrieving entities.
 */
export class Repository {
    /**
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        throw new Error("Repository.findById must be implemented");
    }

    /**
     * @param {Object} entity
     * @returns {Promise<Object>}
     */
    async save(entity) {
        throw new Error("Repository.save must be implemented");
    }

    /**
     * @param {Object} entity
     * @returns {Promise<Object>}
     */
    async update(entity) {
        throw new Error("Repository.update must be implemented");
    }

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error("Repository.delete must be implemented");
    }
}
