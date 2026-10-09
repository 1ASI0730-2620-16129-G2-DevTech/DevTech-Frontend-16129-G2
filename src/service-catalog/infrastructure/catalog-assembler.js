import {LaundryService} from "../domain/model/laundry-service.js";
import {Garment} from "../domain/model/garment.js";

function baseFields(resource) {
    return {
        id: resource.id,
        name: resource.name,
        category: resource.category,
        basePrice: Number(resource.basePrice),
        estimatedHours: Number(resource.estimatedHours),
        active: resource.active,
    };
}

function baseResource(item) {
    return {
        id: item.id,
        name: item.name,
        category: item.category,
        basePrice: item.basePrice,
        estimatedHours: item.estimatedHours,
        active: item.active,
    };
}

/**
 * Maps service catalog API resources (plain JSON) to and from domain objects.
 */
export class CatalogAssembler {
    static toServiceFromResource(resource) {
        return new LaundryService({...baseFields(resource), orderServiceType: resource.orderServiceType ?? null});
    }

    static toResourceFromService(service) {
        return {...baseResource(service), orderServiceType: service.orderServiceType};
    }

    static toGarmentFromResource(resource) {
        return new Garment(baseFields(resource));
    }

    static toResourceFromGarment(garment) {
        return baseResource(garment);
    }

    /** Keeps only what the demand chart needs from an order. */
    static toOrderDemandFromResource(resource) {
        return {
            serviceType: resource.serviceType,
            createdAt: new Date(resource.createdAt),
            items: (resource.items ?? []).map((item) => ({type: item.type, quantity: Number(item.quantity)})),
        };
    }
}
