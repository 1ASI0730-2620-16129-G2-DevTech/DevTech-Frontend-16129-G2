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

    async function persist(resource) {
        const response = await laundryOperationsApi.updateLaundryResource(
            resource.id, LaundryResourceAssembler.toResourceFromEntity(resource));
        const saved = LaundryResourceAssembler.toEntityFromResource(response.data);
        const index = laundryResources.value.findIndex(r => r.id === saved.id);
        if (index !== -1) laundryResources.value[index] = saved;
        return saved;
    }

    /**
     * Refreshes the status of the resources from the IoT sensors (through the ACL).
     * @param {string|null} laundryId - Only the resources of this laundry, or all if null.
     */
    function syncResourceStatuses(laundryId = null) {
        return run(async () => {
            const targets = laundryResources.value.filter(r => laundryId === null || r.laundryId === laundryId);
            await Promise.all(targets.map(async (target) => {
                try {
                    const monitoredStatus = await resourceMonitoring.getResourceStatus(target.id);
                    const resource = requireResource(target.id);
                    const previousStatus = resource.status;
                    resource.applyMonitoredStatus(monitoredStatus);
                    if (resource.status !== previousStatus) await persist(resource);
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

    /** Reserves a resource (BUSY). Throws if it is not available. Called by the laundry operation use cases. */
    async function assignResource(resourceId) {
        const resource = requireResource(resourceId);
        resource.assign();
        return persist(resource);
    }

    /** Releases a resource (AVAILABLE). Does nothing if it is not BUSY. Called by the laundry operation use cases. */
    async function releaseResource(resourceId) {
        const resource = requireResource(resourceId);
        if (resource.status !== ResourceStatus.BUSY) return resource;
        resource.release();
        return persist(resource);
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
        assignResource,
        releaseResource
    };
});

export default useResourceStore;
