import { Repository } from "../domain/model/repository.js";

/**
 * Abstract repository built on top of BaseEndpoint (Axios).
 * Subclasses provide the endpoint and the assembler that maps resources to entities.
 * The assembler must implement toEntityFromResource(resource) and toResourceFromEntity(entity).
 */
export class BaseRepository extends Repository {
    #endpoint;
    #assembler;

    /**
     * @param {Object} params
     * @param {import("./base-endpoint.js").BaseEndpoint} params.endpoint
     * @param {{toEntityFromResource: Function, toResourceFromEntity: Function}} params.assembler
     */
    constructor({ endpoint, assembler }) {
        super();
        if (new.target === BaseRepository) {
            throw new TypeError("BaseRepository is abstract and cannot be instantiated directly");
        }
        this.#endpoint = endpoint;
        this.#assembler = assembler;
    }

    /** @returns {import("./base-endpoint.js").BaseEndpoint} */
    get endpoint() {
        return this.#endpoint;
    }

    get assembler() {
        return this.#assembler;
    }

    async findById(id) {
        try {
            const response = await this.#endpoint.getById(id);
            return this.#assembler.toEntityFromResource(response.data);
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    async save(entity) {
        const response = await this.#endpoint.create(this.#assembler.toResourceFromEntity(entity));
        return this.#assembler.toEntityFromResource(response.data);
    }

    async update(entity) {
        const response = await this.#endpoint.update(entity.id, this.#assembler.toResourceFromEntity(entity));
        return this.#assembler.toEntityFromResource(response.data);
    }

    async delete(id) {
        await this.#endpoint.delete(id);
    }
}
