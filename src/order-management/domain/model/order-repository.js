import { Repository } from "../../../shared/domain/model/repository.js";

/**
 * Port for persisting and retrieving orders.
 */
export class OrderRepository extends Repository {
    /**
     * Finds all the orders of a customer.
     * @param {string} customerId
     * @returns {Promise<import("./order.js").Order[]>}
     */
    async findByCustomer(customerId) {
        throw new Error("OrderRepository.findByCustomer must be implemented");
    }
}
