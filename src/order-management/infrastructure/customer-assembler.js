import { Customer } from "../domain/model/customer.js";

/**
 * Maps customer API resources (plain JSON) to Customer entities.
 */
export class CustomerAssembler {
    /**
     * @param {Object} resource
     * @returns {Customer}
     */
    toEntityFromResource(resource) {
        return new Customer({
            id: resource.id,
            fullName: resource.fullName,
            documentNumber: resource.documentNumber,
        });
    }
}
