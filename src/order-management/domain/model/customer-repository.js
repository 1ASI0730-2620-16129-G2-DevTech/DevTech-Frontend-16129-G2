/**
 * Port for reading the customers that can place orders.
 */
export class CustomerRepository {
    /**
     * @returns {Promise<import("./customer.js").Customer[]>}
     */
    async findAll() {
        throw new Error("CustomerRepository.findAll must be implemented");
    }
}
