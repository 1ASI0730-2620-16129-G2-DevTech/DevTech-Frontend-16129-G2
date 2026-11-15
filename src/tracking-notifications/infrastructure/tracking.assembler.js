import {OrderTracking} from "@/tracking-notifications/domain/model/order-tracking.entity.js";

/** Backend stage names (ETrackingStage) to the stages of the web app (ORDER_STAGES). */
const STAGE_FROM_RESOURCE = Object.freeze({
    RECEIVED: 'received',
    SORTING: 'sorting',
    WASHING: 'washing',
    DRYING_IRONING: 'drying-ironing',
    PACKAGING: 'packaging',
    READY: 'ready'
});

function toStage(value) {
    return STAGE_FROM_RESOURCE[value] ?? String(value ?? '').toLowerCase();
}

export class TrackingAssembler {
    /**
     * @param {Object} resource - TrackingResource of the backend.
     * @param {string} [customerName] - The backend keeps the customer in the order, not in the tracking.
     * @returns {OrderTracking}
     */
    static toEntityFromResource(resource, customerName = '') {
        return new OrderTracking({
            id: resource.id,
            orderId: resource.orderId,
            customerName,
            currentStage: toStage(resource.currentStage),
            estimatedDelivery: resource.estimatedDelivery ?? '',
            history: (resource.history ?? []).map(record => ({stage: toStage(record.stage), occurredAt: record.occurredAt}))
        });
    }

    /** StartTrackingResource of the backend. */
    static toStartResource({orderId, estimatedDelivery}) {
        return {orderId, estimatedDelivery: estimatedDelivery || null};
    }

    /**
     * @param {Object} response
     * @param {(orderId: string) => string} [customerNameOf] - Customer name of each order.
     * @returns {OrderTracking[]}
     */
    static toEntitiesFromResponse(response, customerNameOf = () => '') {
        const resources = Array.isArray(response.data) ? response.data : [];
        return resources.map(resource => this.toEntityFromResource(resource, customerNameOf(resource.orderId)));
    }
}
