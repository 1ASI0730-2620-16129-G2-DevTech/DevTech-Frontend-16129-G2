import { NotFoundError, ValidationError } from "../../shared/domain/model/errors.js";
import { GarmentItem } from "../domain/model/garment-item.js";
import { Order } from "../domain/model/order.js";

/**
 * Application service orchestrating the order use cases.
 */
export class OrderService {
    #orderRepository;

    /**
     * @param {Object} params
     * @param {import("../domain/model/order-repository.js").OrderRepository} params.orderRepository
     */
    constructor({ orderRepository }) {
        this.#orderRepository = orderRepository;
    }

    /**
     * @param {Order} order
     * @returns {Promise<Order>}
     */
    async createOrder(order) {
        if (!(order instanceof Order)) {
            throw new ValidationError("order must be an Order");
        }
        return this.#orderRepository.save(order);
    }

    /**
     * @param {string} id
     * @returns {Promise<Order>}
     * @throws {NotFoundError}
     */
    async getOrderById(id) {
        return this.#getOrderOrThrow(id);
    }

    /**
     * @param {string} customerId
     * @returns {Promise<Order[]>}
     */
    async getOrdersByCustomer(customerId) {
        return this.#orderRepository.findByCustomer(customerId);
    }

    /**
     * @param {Order} order
     * @returns {Promise<Order>}
     * @throws {NotFoundError}
     */
    async updateOrder(order) {
        if (!(order instanceof Order)) {
            throw new ValidationError("order must be an Order");
        }
        await this.#getOrderOrThrow(order.id);
        return this.#orderRepository.update(order);
    }

    /**
     * @param {string} id
     * @param {string} status - One of OrderStatus.
     * @returns {Promise<Order>} The updated order.
     */
    async changeOrderStatus(id, status) {
        const order = await this.#getOrderOrThrow(id);
        order.changeStatus(status);
        return this.#orderRepository.update(order);
    }

    /**
     * @param {string} orderId
     * @param {GarmentItem} item
     * @returns {Promise<GarmentItem>}
     */
    async addItem(orderId, item) {
        this.#assertItemOf(orderId, item);
        const order = await this.#getOrderOrThrow(orderId);
        order.addGarmentItem(item);
        await this.#orderRepository.update(order);
        return item;
    }

    /**
     * Replaces an existing item (matched by id) with the given one.
     * @param {string} orderId
     * @param {GarmentItem} item
     * @returns {Promise<GarmentItem>}
     */
    async updateItem(orderId, item) {
        this.#assertItemOf(orderId, item);
        const order = await this.#getOrderOrThrow(orderId);
        order.removeGarmentItem(item.id);
        order.addGarmentItem(item);
        await this.#orderRepository.update(order);
        return item;
    }

    /**
     * @param {string} orderId
     * @param {string} itemId
     * @returns {Promise<void>}
     */
    async removeItem(orderId, itemId) {
        const order = await this.#getOrderOrThrow(orderId);
        order.removeGarmentItem(itemId);
        await this.#orderRepository.update(order);
    }

    async #getOrderOrThrow(id) {
        const order = await this.#orderRepository.findById(id);
        if (order === null) {
            throw new NotFoundError(`Order ${id} not found`);
        }
        return order;
    }

    #assertItemOf(orderId, item) {
        if (!(item instanceof GarmentItem)) {
            throw new ValidationError("item must be a GarmentItem");
        }
        if (item.orderId !== orderId) {
            throw new ValidationError("Item belongs to a different order");
        }
    }
}
