import {BackendApi, currentLaundryId} from "@/shared/infrastructure/backend-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const laundryOrdersEndpointPath = import.meta.env.VITE_LAUNDRY_ORDERS_ENDPOINT_PATH;
const washingCyclesEndpointPath = import.meta.env.VITE_WASHING_CYCLES_ENDPOINT_PATH;
const laundryResourcesEndpointPath = import.meta.env.VITE_LAUNDRY_RESOURCES_ENDPOINT_PATH;

/**
 * Client of the Laundry Operations backend. The backend changes laundry orders and resources
 * through one operation per use case (classify, prioritize, assign, advance...) instead of a generic update.
 */
export class LaundryOperationsApi extends BackendApi {
    #laundryOrdersEndpoint;
    #washingCyclesEndpoint;
    #laundryResourcesEndpoint;

    constructor() {
        super();
        this.#laundryOrdersEndpoint = new BaseEndpoint(this, laundryOrdersEndpointPath);
        this.#washingCyclesEndpoint = new BaseEndpoint(this, washingCyclesEndpointPath);
        this.#laundryResourcesEndpoint = new BaseEndpoint(this, laundryResourcesEndpointPath);
    }

    // ---------- Laundry orders ----------

    /** Laundry orders of the current laundry. */
    getLaundryOrders() {
        return this.http.get(laundryOrdersEndpointPath, {params: {laundryId: currentLaundryId}});
    }

    getLaundryOrderById(id) {
        return this.#laundryOrdersEndpoint.getById(id);
    }

    /** Receives an order of Order Management (ReceiveLaundryOrderResource). */
    receiveLaundryOrder(resource) {
        return this.#laundryOrdersEndpoint.create(resource);
    }

    /** RECEPTION -> CLASSIFICATION. */
    classifyLaundryOrder(id) {
        return this.http.post(`${laundryOrdersEndpointPath}/${id}/classification`);
    }

    /** PrioritizeLaundryOrderResource. */
    prioritizeLaundryOrder(id, resource) {
        return this.http.put(`${laundryOrdersEndpointPath}/${id}/priority`, resource);
    }

    /** AssignWashingCycleResource. */
    assignWashingCycle(id, resource) {
        return this.http.put(`${laundryOrdersEndpointPath}/${id}/washing-cycle`, resource);
    }

    /** AssignLaundryResourceResource: the backend reserves the resource for the order. */
    assignLaundryResource(id, resource) {
        return this.http.put(`${laundryOrdersEndpointPath}/${id}/resource`, resource);
    }

    /** Moves the order to its next stage; on READY the backend frees its resource. */
    advanceLaundryOrderStage(id) {
        return this.http.post(`${laundryOrdersEndpointPath}/${id}/stage-advancements`);
    }

    // ---------- Washing cycles ----------

    getWashingCycles() {
        return this.#washingCyclesEndpoint.getAll();
    }

    /** WashingCycleRepository.findCompatible(type) */
    getCompatibleWashingCycles(type) {
        return this.http.get(washingCyclesEndpointPath, {params: {compatibleType: type}});
    }

    // ---------- Laundry resources ----------

    /** Resources of the current laundry. */
    getLaundryResources() {
        return this.http.get(laundryResourcesEndpointPath, {params: {laundryId: currentLaundryId}});
    }

    /** SynchronizeResourceResource: status reported by the monitoring. */
    synchronizeLaundryResourceStatus(id, resource) {
        return this.http.put(`${laundryResourcesEndpointPath}/${id}/status`, resource);
    }

    /** Frees a BUSY resource that no order is using any more. */
    releaseLaundryResource(id) {
        return this.http.post(`${laundryResourcesEndpointPath}/${id}/release`);
    }
}
