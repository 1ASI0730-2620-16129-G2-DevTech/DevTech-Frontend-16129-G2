import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {LaundryOperationsApi} from "@/laundry-operations/infrastructure/laundry-operations-api.js";
import {LaundryOrderAssembler} from "@/laundry-operations/infrastructure/laundry-order.assembler.js";
import {WashingCycleAssembler} from "@/laundry-operations/infrastructure/washing-cycle.assembler.js";
import {LaundryResourceAssembler} from "@/laundry-operations/infrastructure/laundry-resource.assembler.js";
import {LaundryOrder} from "@/laundry-operations/domain/model/laundry-order.entity.js";
import {LaundryResource} from "@/laundry-operations/domain/model/laundry-resource.entity.js";
import {PROCESSING_STAGES, ProcessingStage} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";
import {generateUuid} from "@/shared/domain/model/uuid.js";
import {ValidationError} from "@/shared/domain/model/errors.js";

const laundryOperationsApi = new LaundryOperationsApi();

const useLaundryOperationsStore = defineStore("laundry-operations", () => {
    const laundryOrders = ref([]);
    const washingCycles = ref([]);
    const laundryResources = ref([]);
    const errors = ref([]);
    const laundryOrdersLoaded = ref(false);
    const washingCyclesLoaded = ref(false);
    const laundryResourcesLoaded = ref(false);

    /** Orders grouped by processing stage (used by the production board). */
    const ordersByStage = computed(() => {
        const groups = Object.fromEntries(PROCESSING_STAGES.map(stage => [stage, []]));
        laundryOrders.value.forEach(order => groups[order.currentStage].push(order));
        return groups;
    });

    const availableResources = computed(() => laundryResources.value.filter(resource => resource.isAvailable()));

    const vipOrders = computed(() => laundryOrders.value.filter(order => order.isVip && !order.isReady));

    const atRiskOrders = computed(() => laundryOrders.value.filter(order => order.isAtDeliveryRisk()));

    /** Counters for the summary cards: pending (RECEPTION), in process, ready, VIP and at risk. */
    const summary = computed(() => {
        const groups = ordersByStage.value;
        const inProcessStages = [
            ProcessingStage.CLASSIFICATION,
            ProcessingStage.WASHING,
            ProcessingStage.DRYING_IRONING,
            ProcessingStage.PACKAGING
        ];
        return {
            pending: groups[ProcessingStage.RECEPTION].length,
            inProcess: inProcessStages.reduce((total, stage) => total + groups[stage].length, 0),
            ready: groups[ProcessingStage.READY].length,
            vip: vipOrders.value.length,
            atRisk: atRiskOrders.value.length
        };
    });

    /** Runs a use case, collecting any error (domain or HTTP) in `errors`. */
    async function run(useCase) {
        try {
            return await useCase();
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    function clearErrors() {
        errors.value = [];
    }

    // ---------- Queries ----------

    function fetchLaundryOrders() {
        return run(async () => {
            const response = await laundryOperationsApi.getLaundryOrders();
            laundryOrders.value = LaundryOrderAssembler.toEntitiesFromResponse(response);
            laundryOrdersLoaded.value = true;
        });
    }

    function fetchWashingCycles() {
        return run(async () => {
            const response = await laundryOperationsApi.getWashingCycles();
            washingCycles.value = WashingCycleAssembler.toEntitiesFromResponse(response);
            washingCyclesLoaded.value = true;
        });
    }

    function fetchLaundryResources() {
        return run(async () => {
            const response = await laundryOperationsApi.getLaundryResources();
            laundryResources.value = LaundryResourceAssembler.toEntitiesFromResponse(response);
            laundryResourcesLoaded.value = true;
        });
    }

    function getLaundryOrderById(id) {
        return laundryOrders.value.find(order => order.id === id);
    }

    function getWashingCycleById(id) {
        return washingCycles.value.find(cycle => cycle.id === id);
    }

    function getLaundryResourceById(id) {
        return laundryResources.value.find(resource => resource.id === id);
    }

    // ---------- Internal helpers ----------

    function requireOrder(id) {
        const order = getLaundryOrderById(id);
        if (!order) throw new ValidationError(`Laundry order not found: ${id}`);
        return new LaundryOrder({...order});
    }

    function requireResource(id) {
        const resource = getLaundryResourceById(id);
        if (!resource) throw new ValidationError(`Laundry resource not found: ${id}`);
        return new LaundryResource({...resource});
    }

    async function persistOrder(order) {
        const response = await laundryOperationsApi.updateLaundryOrder(
            order.id, LaundryOrderAssembler.toResourceFromEntity(order));
        const saved = LaundryOrderAssembler.toEntityFromResource(response.data);
        const index = laundryOrders.value.findIndex(o => o.id === saved.id);
        if (index !== -1) laundryOrders.value[index] = saved;
        return saved;
    }

    async function persistResource(resource) {
        const response = await laundryOperationsApi.updateLaundryResource(
            resource.id, LaundryResourceAssembler.toResourceFromEntity(resource));
        const saved = LaundryResourceAssembler.toEntityFromResource(response.data);
        const index = laundryResources.value.findIndex(r => r.id === saved.id);
        if (index !== -1) laundryResources.value[index] = saved;
        return saved;
    }

    async function releaseBusyResource(resourceId) {
        const resource = requireResource(resourceId);
        if (resource.status !== ResourceStatus.BUSY) return;
        resource.release();
        await persistResource(resource);
    }

    // ---------- Commands (use cases) ----------

    /** Receive Order: creates the laundry order for an order coming from Order Management. */
    function receiveOrder(orderId, expectedCompletion = null) {
        return run(async () => {
            const order = new LaundryOrder({id: generateUuid(), orderId, expectedCompletion});
            order.receive();
            const response = await laundryOperationsApi.createLaundryOrder(
                LaundryOrderAssembler.toResourceFromEntity(order));
            laundryOrders.value.push(LaundryOrderAssembler.toEntityFromResource(response.data));
        });
    }

    /** Classify Order. */
    function classifyOrder(id) {
        return run(async () => {
            const order = requireOrder(id);
            order.classify();
            await persistOrder(order);
        });
    }

    /** Assign Washing Cycle + Assign Resource (both required before washing). */
    function assignCycleAndResource(orderId, cycleId, resourceId) {
        return run(async () => {
            const order = requireOrder(orderId);
            const cycle = getWashingCycleById(cycleId);
            if (!cycle) throw new ValidationError(`Washing cycle not found: ${cycleId}`);
            const resource = requireResource(resourceId);
            const previousResourceId = order.resourceId;
            const sameResource = previousResourceId === resourceId;

            order.assignCycle(cycle);
            order.assignResource(resource);
            if (!sameResource) resource.assign();

            if (!sameResource) await persistResource(resource);
            await persistOrder(order);
            if (previousResourceId && !sameResource) await releaseBusyResource(previousResourceId);
        });
    }

    /** Advance Stage. When the order becomes READY its resource is released. */
    function advanceStage(id) {
        return run(async () => {
            const order = requireOrder(id);
            order.advanceStage();
            const saved = await persistOrder(order);
            if (saved.isReady && saved.resourceId) await releaseBusyResource(saved.resourceId);
        });
    }

    /** Prioritize VIP Order. */
    function prioritizeOrder(id) {
        return run(async () => {
            const order = requireOrder(id);
            order.setPriority(Priority.VIP);
            await persistOrder(order);
        });
    }

    return {
        laundryOrders,
        washingCycles,
        laundryResources,
        errors,
        laundryOrdersLoaded,
        washingCyclesLoaded,
        laundryResourcesLoaded,
        ordersByStage,
        availableResources,
        vipOrders,
        atRiskOrders,
        summary,
        clearErrors,
        fetchLaundryOrders,
        fetchWashingCycles,
        fetchLaundryResources,
        getLaundryOrderById,
        getWashingCycleById,
        getLaundryResourceById,
        receiveOrder,
        classifyOrder,
        assignCycleAndResource,
        advanceStage,
        prioritizeOrder
    };
});

export default useLaundryOperationsStore;
