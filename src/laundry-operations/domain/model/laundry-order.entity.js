import {ValidationError} from "@/shared/domain/model/errors.js";
import {PROCESSING_STAGES, ProcessingStage} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";
import {WashingCycle} from "@/laundry-operations/domain/model/washing-cycle.entity.js";
import {LaundryResource} from "@/laundry-operations/domain/model/laundry-resource.entity.js";

function ensureStage(order, expected, action) {
    if (order.currentStage !== expected) {
        throw new ValidationError(`Cannot ${action}: order is in ${order.currentStage}, expected ${expected}`);
    }
}

/**
 * Aggregate root that represents the operational processing of an order inside a laundry.
 * Its `orderId` references the Order aggregate of the Order Management context (by id only).
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

    /** Registers the arrival of the order (RECEPTION stage). */
    receive() {
        if (!this.orderId) {
            throw new ValidationError("A laundry order must reference an order");
        }
        this.currentStage = ProcessingStage.RECEPTION;
    }

    /** RECEPTION -> CLASSIFICATION. */
    classify() {
        ensureStage(this, ProcessingStage.RECEPTION, 'classify the order');
        this.advanceStage();
    }

    /**
     * Assigns a washing cycle. Only allowed while the order is in CLASSIFICATION.
     * @param {WashingCycle} cycle
     */
    assignCycle(cycle) {
        if (!(cycle instanceof WashingCycle)) {
            throw new ValidationError("A valid washing cycle is required");
        }
        ensureStage(this, ProcessingStage.CLASSIFICATION, 'assign a washing cycle');
        this.washingCycleId = cycle.id;
    }

    /**
     * Assigns a resource. Only allowed while the order is in CLASSIFICATION and the resource is available.
     * @param {LaundryResource} resource
     */
    assignResource(resource) {
        if (!(resource instanceof LaundryResource)) {
            throw new ValidationError("A valid resource is required");
        }
        ensureStage(this, ProcessingStage.CLASSIFICATION, 'assign a resource');
        if (resource.id === this.resourceId) return;
        if (!resource.isAvailable()) {
            throw new ValidationError(`Resource "${resource.name}" is not available`);
        }
        this.resourceId = resource.id;
    }

    /** Moves the order to the next stage. WASHING requires a cycle and a resource. */
    advanceStage() {
        if (this.isReady) {
            throw new ValidationError("The order is already READY");
        }
        const next = PROCESSING_STAGES[PROCESSING_STAGES.indexOf(this.currentStage) + 1];
        if (next === ProcessingStage.WASHING && (!this.washingCycleId || !this.resourceId)) {
            throw new ValidationError("A washing cycle and a resource are required to start washing");
        }
        this.currentStage = next;
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
