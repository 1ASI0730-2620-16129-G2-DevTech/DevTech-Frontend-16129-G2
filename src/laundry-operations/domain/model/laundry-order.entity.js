import {ValidationError} from "@/shared/domain/model/errors.js";
import {
    nextStage,
    PROCESSING_STAGES,
    ProcessingStage
} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";

function ensureStage(order, expected, action) {
    if (order.currentStage !== expected) {
        throw new ValidationError(`Cannot ${action}: order is in ${order.currentStage}, expected ${expected}`);
    }
}

/**
 * Aggregate root that represents the operational processing of an order inside a laundry.
 * It references other aggregates only by id: `orderId` (Order Management),
 * `washingCycleId` and `resourceId` (this context).
 */
export class LaundryOrder {
    constructor({
                    id = null,
                    orderId = null,
                    currentStage = ProcessingStage.RECEPTION,
                    priority = Priority.NORMAL,
                    washingCycleId = null,
                    resourceId = null,
                    expectedCompletion = null
                } = {}) {
        if (!PROCESSING_STAGES.includes(currentStage)) {
            throw new ValidationError(`Invalid processing stage: ${currentStage}`);
        }
        if (!Object.values(Priority).includes(priority)) {
            throw new ValidationError(`Invalid priority: ${priority}`);
        }
        this.id = id;
        this.orderId = orderId;
        this.currentStage = currentStage;
        this.priority = priority;
        this.washingCycleId = washingCycleId;
        this.resourceId = resourceId;
        this.expectedCompletion = expectedCompletion ? new Date(expectedCompletion) : null;
    }

    get isReady() {
        return this.currentStage === ProcessingStage.READY;
    }

    get isVip() {
        return this.priority === Priority.VIP;
    }

    /**
     * Moves the order to the next stage. WASHING requires a washing cycle and a resource.
     * @param {string|null} stage - Optional target stage; it must be the next one (stages cannot be skipped).
     */
    advanceStage(stage = null) {
        if (this.isReady) {
            throw new ValidationError("The order is already READY");
        }
        const next = nextStage(this.currentStage);
        if (stage !== null && stage !== next) {
            throw new ValidationError(`Cannot move from ${this.currentStage} to ${stage}: the next stage is ${next}`);
        }
        if (next === ProcessingStage.WASHING && (!this.washingCycleId || !this.resourceId)) {
            throw new ValidationError("A washing cycle and a resource are required to start washing");
        }
        this.currentStage = next;
    }

    /**
     * Assigns a washing cycle. Only allowed while the order is in CLASSIFICATION.
     * @param {string} cycleId
     */
    assignWashingCycle(cycleId) {
        if (!cycleId) {
            throw new ValidationError("A washing cycle is required");
        }
        ensureStage(this, ProcessingStage.CLASSIFICATION, 'assign a washing cycle');
        this.washingCycleId = cycleId;
    }

    /**
     * Assigns a resource. Only allowed while the order is in CLASSIFICATION.
     * Checking that the resource is available is the responsibility of the application layer.
     * @param {string} resourceId
     */
    assignResource(resourceId) {
        if (!resourceId) {
            throw new ValidationError("A resource is required");
        }
        ensureStage(this, ProcessingStage.CLASSIFICATION, 'assign a resource');
        this.resourceId = resourceId;
    }

    /**
     * Sets the priority of the order.
     * @param {string} priority - A value of {@link Priority}.
     */
    setPriority(priority) {
        if (!Object.values(Priority).includes(priority)) {
            throw new ValidationError(`Invalid priority: ${priority}`);
        }
        if (this.isReady) {
            throw new ValidationError("Cannot change the priority of a READY order");
        }
        this.priority = priority;
    }

    /** A VIP order is at delivery risk when it is not READY and its expected completion has passed. */
    isAtDeliveryRisk(now = new Date()) {
        return this.isVip && !this.isReady && this.expectedCompletion !== null && now > this.expectedCompletion;
    }
}
