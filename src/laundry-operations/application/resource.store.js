import {defineStore} from "pinia";
import {ref} from "vue";
import {LaundryOperationsApi} from "@/laundry-operations/infrastructure/laundry-operations-api.js";
import {LaundryResourceAssembler} from "@/laundry-operations/infrastructure/laundry-resource.assembler.js";
import {ResourceMonitoringACL} from "@/laundry-operations/infrastructure/resource-monitoring.acl.js";
import {LaundryResource} from "@/laundry-operations/domain/model/laundry-resource.entity.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";
import {ValidationError} from "@/shared/domain/model/errors.js";

const laundryOperationsApi = new LaundryOperationsApi();
const resourceMonitoring = new ResourceMonitoringACL();

/** ResourceService: manages the laundry resources and monitors them through the anti-corruption layer. */
const useResourceStore = defineStore("laundry-resource", () => {
    const laundryResources = ref([]);
    const errors = ref([]);
    const laundryResourcesLoaded = ref(false);

    /** Runs a use case, collecting any error in `errors`. Returns true if it succeeded. */
    async function run(useCase) {
        try {
            await useCase();
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    function clearErrors() {
        errors.value = [];
    }

    function fetchLaundryResources() {
        return run(async () => {
            const response = await laundryOperationsApi.getLaundryResources();
            laundryResources.value = LaundryResourceAssembler.toEntitiesFromResponse(response);
            laundryResourcesLoaded.value = true;
        });
    }

    function getLaundryResourceById(id) {
        return laundryResources.value.find(resource => resource.id === id);
    }

    function requireResource(id) {
        const resource = getLaundryResourceById(id);
        if (!resource) throw new ValidationError(`Laundry resource not found: ${id}`);
        return new LaundryResource({...resource});
    }

    /** Sends the status reported by the monitoring to the backend and keeps it in the state. */
    async function synchronizeStatus(resource) {
        await laundryOperationsApi.synchronizeLaundryResourceStatus(
            resource.id, LaundryResourceAssembler.toStatusResource(resource.status));
        const index = laundryResources.value.findIndex(r => r.id === resource.id);
        if (index !== -1) laundryResources.value[index] = resource;
        return resource;
    }

    /**
     * Refreshes the status of the resources from the IoT sensors (through the ACL).
     * Resources without telemetry keep the status stored in the backend.
     * @param {string|null} laundryId - Only the resources of this laundry, or all if null.
     */
    function syncResourceStatuses(laundryId = null) {
        return run(async () => {
            const targets = laundryResources.value.filter(r => laundryId === null || r.laundryId === laundryId);
            await Promise.all(targets.map(async (target) => {
                try {
                    const monitoredStatus = await resourceMonitoring.getResourceStatus(target.id);
                    if (monitoredStatus === null) return;
                    const resource = requireResource(target.id);
                    const previousStatus = resource.status;
                    resource.applyMonitoredStatus(monitoredStatus);
                    if (resource.status !== previousStatus) await synchronizeStatus(resource);
                } catch (error) {
                    errors.value.push(error);
                }
            }));
        });
    }

    /**
     * Available resources of a laundry, after refreshing their status from the sensors.
     * @param {string|null} laundryId
     * @returns {Promise<LaundryResource[]>}
     */
    async function getAvailableResources(laundryId) {
        await syncResourceStatuses(laundryId);
        return laundryResources.value.filter(r => r.laundryId === laundryId && r.isAvailable());
    }

    /**
     * Frees a BUSY resource that no order is using any more (AVAILABLE). Does nothing if it is not BUSY.
     * Resources reserved by an order are freed by the backend when the order becomes READY.
     */
    async function releaseResource(resourceId) {
        const resource = requireResource(resourceId);
        if (resource.status !== ResourceStatus.BUSY) return resource;
        resource.release();
        await laundryOperationsApi.releaseLaundryResource(resourceId);
        const index = laundryResources.value.findIndex(r => r.id === resourceId);
        if (index !== -1) laundryResources.value[index] = resource;
        return resource;
    }

    return {
        laundryResources,
        errors,
        laundryResourcesLoaded,
        clearErrors,
        fetchLaundryResources,
        getLaundryResourceById,
        syncResourceStatuses,
        getAvailableResources,
        releaseResource
    };
});

export default useResourceStore;
