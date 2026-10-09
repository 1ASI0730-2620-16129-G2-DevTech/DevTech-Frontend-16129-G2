import { Order } from "../domain/model/order.js";

/**
 * Entry point of the Order Management context for the UI.
 * Receives plain request objects and returns plain response objects.
 */
export class OrderController {
    #orderService;

    /**
     * @param {Object} params
     * @param {import("../application/order-service.js").OrderService} params.orderService
     */
    constructor({ orderService }) {
        this.#orderService = orderService;
    }

    /**
     * @param {Object} request
     * @param {string} request.customerId
     * @param {string} request.laundryId
     * @param {string} request.deliveryMethod
     * @param {string} request.serviceType
     * @param {Date} request.estimatedDeliveryDate
     * @param {Date} [request.receptionDate] - Now by default.
     * @param {string} [request.status] - Initial status; CREATED by default.
     * @param {string} [request.specialCareInstructions]
     * @param {{type: string, quantity: number, careInstructions?: string}[]} [request.items]
     * @returns {Promise<Object>} The created order.
     */
    async create(request) {
        return toResponse(await this.#orderService.placeOrder(request));
    }

    /**
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async getById(id) {
        return toResponse(await this.#orderService.getOrderById(id));
    }

    /**
     * Updates the delivery method and/or the special care instructions.
     * @param {string} id
     * @param {Object} request
     * @param {string} [request.deliveryMethod]
     * @param {string} [request.specialCareInstructions]
     * @returns {Promise<Object>}
     */
    async update(id, request) {
        const current = await this.#orderService.getOrderById(id);
        const updated = new Order({
            id: current.id,
            customerId: current.customerId,
            laundryId: current.laundryId,
            deliveryMethod: request.deliveryMethod ?? current.deliveryMethod,
            serviceType: request.serviceType ?? current.serviceType,
            estimatedDeliveryDate: request.estimatedDeliveryDate ?? current.estimatedDeliveryDate,
            specialCareInstructions: request.specialCareInstructions ?? current.specialCareInstructions,
            status: current.status,
            createdAt: current.createdAt,
            items: current.items,
        });
        return toResponse(await this.#orderService.updateOrder(updated));
    }

    /**
     * @param {string} id
     * @param {string} status - One of OrderStatus.
     * @returns {Promise<Object>}
     */
    async changeStatus(id, status) {
        return toResponse(await this.#orderService.changeOrderStatus(id, status));
    }
}

/**
 * @param {Order} order
 * @returns {Object}
 */
function toResponse(order) {
    return {
        id: order.id,
        customerId: order.customerId,
        laundryId: order.laundryId,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        serviceType: order.serviceType,
        estimatedDeliveryDate: order.estimatedDeliveryDate.toISOString(),
        specialCareInstructions: order.specialCareInstructions,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            type: item.type,
            quantity: item.quantity,
            careInstructions: item.careInstructions,
        })),
    };
}
