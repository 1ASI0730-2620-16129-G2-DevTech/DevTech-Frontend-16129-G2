import {Customer} from "../domain/model/customer.js";

/**
 * Maps customer API resources (plain JSON) to and from Customer entities.
 */
export class CustomerAssembler {
    static toEntityFromResource(resource) {
        return new Customer({
            id: resource.id,
            fullName: resource.fullName,
            phone: resource.phone,
            documentType: resource.documentType,
            documentNumber: resource.documentNumber,
            address: resource.address,
        });
    }

    static toEntitiesFromResponse(response) {
        return response.data.map((resource) => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(customer) {
        return {
            id: customer.id,
            fullName: customer.fullName,
            phone: customer.phone,
            documentType: customer.documentType,
            documentNumber: customer.documentNumber,
            address: customer.address,
        };
    }
}
