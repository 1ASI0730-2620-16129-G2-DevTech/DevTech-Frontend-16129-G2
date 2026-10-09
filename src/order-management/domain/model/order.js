import { AggregateRoot } from "../../../shared/domain/model/aggregate-root.js";
import { NotFoundError, ValidationError } from "../../../shared/domain/model/errors.js";
import { generateUuid, validateUuid } from "../../../shared/domain/model/uuid.js";
import { isValidCustomerId } from "./customer.js";
import { DeliveryMethod } from "./delivery-method.js";
import { GarmentItem } from "./garment-item.js";
import { ORDER_STATUS_SEQUENCE, OrderStatus } from "./order-status.js";
import { ServiceType } from "./service-type.js";

/**
 * Aggregate root representing a laundry order.
 * customerId and laundryId reference the Customer & Business context by id only.
 */
export class Order extends AggregateRoot {
    #customerId;
    #laundryId;
    #status;
    #deliveryMethod;
    #serviceType;
    #estimatedDeliveryDate;
    #specialCareInstructions;
    #createdAt;
    #items;

    /**
     * Creates an order. A new order only needs id, customerId, laundryId and
     * deliveryMethod; status, createdAt and items are accepted to rebuild an
     * existing order (e.g. when reading it from the API).
     * @param {Object} params
     * @param {string} [params.id] - UUID; generated when omitted.
     * @param {string} params.customerId - Customer code, e.g. CL001.
     * @param {string} params.laundryId
     * @param {string} params.deliveryMethod - One of DeliveryMethod.
     * @param {string} params.serviceType - One of ServiceType.
     * @param {Date} params.estimatedDeliveryDate - Not before the day the order was created.
     * @param {string} [params.specialCareInstructions]
     * @param {string} [params.status] - One of OrderStatus; CREATED by default.
     * @param {Date} [params.createdAt] - Now by default.
     * @param {GarmentItem[]} [params.items]
     */
    constructor({
        id = generateUuid(),
        customerId,
        laundryId,
        deliveryMethod,
        serviceType,
        estimatedDeliveryDate,
        specialCareInstructions = "",
        status = OrderStatus.CREATED,
        createdAt = new Date(),
        items = [],
    }) {
        super(id);
        if (!isValidCustomerId(customerId)) {
            throw new ValidationError("Order customerId must follow the CL000 format");
        }
        if (!validateUuid(laundryId)) {
            throw new ValidationError("Order laundryId must be a valid UUID");
        }
        if (!Object.values(DeliveryMethod).includes(deliveryMethod)) {
            throw new ValidationError(`Order deliveryMethod must be one of ${Object.values(DeliveryMethod).join(", ")}`);
        }
        if (!Object.values(ServiceType).includes(serviceType)) {
            throw new ValidationError(`Order serviceType must be one of ${Object.values(ServiceType).join(", ")}`);
        }
        if (typeof specialCareInstructions !== "string") {
            throw new ValidationError("Order special care instructions must be a string");
        }
        if (!ORDER_STATUS_SEQUENCE.includes(status)) {
            throw new ValidationError(`Order status must be one of ${ORDER_STATUS_SEQUENCE.join(", ")}`);
        }
        if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
            throw new ValidationError("Order createdAt must be a valid date");
        }
        if (!(estimatedDeliveryDate instanceof Date) || Number.isNaN(estimatedDeliveryDate.getTime())) {
            throw new ValidationError("Order estimatedDeliveryDate must be a valid date");
        }
        if (startOfDay(estimatedDeliveryDate) < startOfDay(createdAt)) {
            throw new ValidationError("Order estimatedDeliveryDate cannot be before the reception date");
        }
        if (!Array.isArray(items) || items.some((item) => !(item instanceof GarmentItem) || item.orderId !== id)) {
            throw new ValidationError("Order items must be GarmentItem objects belonging to this order");
        }

        this.#customerId = customerId;
        this.#laundryId = laundryId;
        this.#deliveryMethod = deliveryMethod;
        this.#serviceType = serviceType;
        this.#estimatedDeliveryDate = new Date(estimatedDeliveryDate);
        this.#specialCareInstructions = specialCareInstructions.trim();
        this.#status = status;
        this.#createdAt = new Date(createdAt);
        this.#items = [...items];
        Object.freeze(this);
    }

    get customerId() {
        return this.#customerId;
    }

    get laundryId() {
        return this.#laundryId;
    }

    get status() {
        return this.#status;
    }

    get deliveryMethod() {
        return this.#deliveryMethod;
    }

    get serviceType() {
        return this.#serviceType;
    }

    get estimatedDeliveryDate() {
        return new Date(this.#estimatedDeliveryDate);
    }

    /** @returns {number} Total number of garments across all the items. */
    get garmentCount() {
        return this.#items.reduce((total, item) => total + item.quantity, 0);
    }

    get specialCareInstructions() {
        return this.#specialCareInstructions;
    }

    get createdAt() {
        return new Date(this.#createdAt);
    }

    /** @returns {GarmentItem[]} A copy of the order items. */
    get items() {
        return [...this.#items];
    }

    /**
     * Adds a garment item. Only allowed while the order is CREATED.
     * @param {GarmentItem} item
     * @throws {ValidationError}
     */
    addGarmentItem(item) {
        this.#assertEditable();
        if (!(item instanceof GarmentItem)) {
            throw new ValidationError("Item must be a GarmentItem");
        }
        if (item.orderId !== this.id) {
            throw new ValidationError("Item belongs to a different order");
        }
        if (this.#items.some((existing) => existing.id === item.id)) {
            throw new ValidationError("Item already exists in the order");
        }
        this.#items.push(item);
    }

    /**
     * Removes a garment item. Only allowed while the order is CREATED.
     * @param {string} itemId
     * @throws {NotFoundError} If the item is not in the order.
     */
    removeGarmentItem(itemId) {
        this.#assertEditable();
        const index = this.#items.findIndex((item) => item.id === itemId);
        if (index === -1) {
            throw new NotFoundError(`Item ${itemId} not found in order ${this.id}`);
        }
        this.#items.splice(index, 1);
    }

    /**
     * Moves the order to the next status of the lifecycle
     * (CREATED → RECEIVED → CLASSIFIED → IN_PROCESS → READY → DELIVERED).
     * @param {string} status - The new status.
     * @throws {ValidationError} If the transition is not allowed.
     */
    changeStatus(status) {
        if (!ORDER_STATUS_SEQUENCE.includes(status)) {
            throw new ValidationError(`Order status must be one of ${ORDER_STATUS_SEQUENCE.join(", ")}`);
        }
        const expected = ORDER_STATUS_SEQUENCE[ORDER_STATUS_SEQUENCE.indexOf(this.#status) + 1];
        if (status !== expected) {
            throw new ValidationError(
                expected === undefined
                    ? `Order is already ${this.#status}`
                    : `Cannot change status from ${this.#status} to ${status}; next allowed status is ${expected}`,
            );
        }
        if (this.#status === OrderStatus.CREATED && this.#items.length === 0) {
            throw new ValidationError("An order needs at least one garment item to be received");
        }
        this.#status = status;
    }

    #assertEditable() {
        if (this.#status !== OrderStatus.CREATED) {
            throw new ValidationError("Items can only be changed while the order is CREATED");
        }
    }
}

/** @returns {number} Midnight of the given date, to compare calendar days. */
function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
