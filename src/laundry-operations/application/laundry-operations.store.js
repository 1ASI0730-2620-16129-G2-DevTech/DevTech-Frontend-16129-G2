import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {LaundryOperationsApi} from "@/laundry-operations/infrastructure/laundry-operations-api.js";
import {LaundryOrderAssembler} from "@/laundry-operations/infrastructure/laundry-order.assembler.js";
import {WashingCycleAssembler} from "@/laundry-operations/infrastructure/washing-cycle.assembler.js";
import {LaundryOrder} from "@/laundry-operations/domain/model/laundry-order.entity.js";
import {PROCESSING_STAGES, ProcessingStage} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";
import useResourceStore from "@/laundry-operations/application/resource.store.js";
import {validateUuid} from "@/shared/domain/model/uuid.js";
import {currentLaundryId} from "@/shared/infrastructure/backend-api.js";
import {ValidationError} from "@/shared/domain/model/errors.js";

const laundryOperationsApi = new LaundryOperationsApi();

/** LaundryOperationService: use cases of the processing of an order inside the laundry. */
const useLaundryOperationStore = defineStore("laundry-operation", () => {
    const resourceStore = useResourceStore();

    const laundryOrders = ref([]);
    const washingCycles = ref([]);
    const errors = ref([]);
    const laundryOrdersLoaded = ref(false);
    const washingCyclesLoaded = ref(false);

    /** Orders grouped by processing stage (used by the dashboard). */
    const ordersByStage = computed(() => {
        const groups = Object.fromEntries(PROCESSING_STAGES.map(stage => [stage, []]));
        laundryOrders.value.forEach(order => groups[order.currentStage].push(order));
        return groups;
    });

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

    /** Runs a use case, collecting any error (domain or HTTP) in `errors`. Returns true if it succeeded. */
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

    // ---------- Queries ----------

    async function loadLaundryOrders() {
        const response = await laundryOperationsApi.getLaundryOrders();
        laundryOrders.value = LaundryOrderAssembler.toEntitiesFromResponse(response);
        laundryOrdersLoaded.value = true;
    }

    function fetchLaundryOrders() {
        return run(loadLaundryOrders);
    }

    function fetchWashingCycles() {
        return run(async () => {
            const response = await laundryOperationsApi.getWashingCycles();
            washingCycles.value = WashingCycleAssembler.toEntitiesFromResponse(response);
            washingCyclesLoaded.value = true;
        });
    }

    /** WashingCycleRepository.findCompatible(type) */
    async function findCompatibleWashingCycles(type) {
        try {
            const response = await laundryOperationsApi.getCompatibleWashingCycles(type);
            return WashingCycleAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
            return [];
        }
    }

    function getLaundryOrderById(id) {
        return laundryOrders.value.find(order => order.id === id);
    }

    function getWashingCycleById(id) {
        return washingCycles.value.find(cycle => cycle.id === id);
    }

    /** True when the order of Order Management already has its laundry order. */
    function isOrderReceived(orderId) {
        return laundryOrders.value.some(order => order.orderId === orderId);
    }

    // ---------- Internal helpers ----------

    function requireOrder(id) {
        const order = getLaundryOrderById(id);
        if (!order) throw new ValidationError(`Laundry order not found: ${id}`);
        return new LaundryOrder({...order});
    }

    /** Reads the laundry order again from the backend after an operation changed it. */
    async function refreshOrder(id) {
        const response = await laundryOperationsApi.getLaundryOrderById(id);
        const saved = LaundryOrderAssembler.toEntityFromResource(response.data);
        const index = laundryOrders.value.findIndex(o => o.id === saved.id);
        if (index !== -1) laundryOrders.value[index] = saved;
        else laundryOrders.value.push(saved);
        return saved;
    }

    // ---------- Use cases ----------
    // Each use case checks the rules on the domain model first (clear errors without a round trip)
    // and then asks the backend to run the same operation, which keeps the real state.

    /**
     * receiveOrder(orderId, expectedCompletion): creates the laundry order for an order coming from Order Management.
     * The order id must be the real id (UUID), and an order can only be received once.
     */
    function receiveOrder(orderId, expectedCompletion = null) {
        return run(async () => {
            if (!validateUuid(orderId)) throw new ValidationError(`A laundry order must reference a valid order id: ${orderId}`);
            if (!laundryOrdersLoaded.value) await loadLaundryOrders();
            if (isOrderReceived(orderId)) throw new ValidationError(`The order was already received: ${orderId}`);
            await laundryOperationsApi.receiveLaundryOrder(LaundryOrderAssembler.toReceiveResource({
                orderId, laundryId: currentLaundryId, priority: Priority.NORMAL, expectedCompletion
            }));
            await loadLaundryOrders();
        });
    }

    /** classifyOrder(orderId): RECEPTION -> CLASSIFICATION. */
    function classifyOrder(orderId) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.advanceStage(ProcessingStage.CLASSIFICATION);
            await laundryOperationsApi.classifyLaundryOrder(orderId);
            await refreshOrder(orderId);
        });
    }

    /** assignWashingCycle(orderId, cycleId) */
    function assignWashingCycle(orderId, cycleId) {
        return run(async () => {
            const order = requireOrder(orderId);
            if (!getWashingCycleById(cycleId)) throw new ValidationError(`Washing cycle not found: ${cycleId}`);
            order.assignWashingCycle(cycleId);
            await laundryOperationsApi.assignWashingCycle(orderId, {washingCycleId: cycleId});
            await refreshOrder(orderId);
        });
    }

    /**
     * assignResource(orderId, resourceId): the backend reserves the resource and links it to the order.
     * The resources are read again, because their status changes with the assignment.
     */
    function assignResource(orderId, resourceId) {
        return run(async () => {
            const order = requireOrder(orderId);
            if (order.resourceId === resourceId) return;
            const resource = resourceStore.getLaundryResourceById(resourceId);
            if (!resource) throw new ValidationError(`Laundry resource not found: ${resourceId}`);
            if (!resource.isAvailable()) throw new ValidationError(`Resource "${resource.name}" is not available`);
            order.assignResource(resourceId);
            try {
                await laundryOperationsApi.assignLaundryResource(orderId, {resourceId});
                await refreshOrder(orderId);
            } finally {
                await resourceStore.fetchLaundryResources();
            }
        });
    }

    /** advanceStage(orderId, stage): when the order becomes READY, the backend frees its resource. */
    function advanceStage(orderId, stage = null) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.advanceStage(stage);
            await laundryOperationsApi.advanceLaundryOrderStage(orderId);
            const saved = await refreshOrder(orderId);
            if (saved.isReady && order.resourceId) await resourceStore.fetchLaundryResources();
        });
    }

    /** prioritizeOrder(orderId): marks the order as VIP. */
    function prioritizeOrder(orderId) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.setPriority(Priority.VIP);
            await laundryOperationsApi.prioritizeLaundryOrder(orderId, LaundryOrderAssembler.toPriorityResource(Priority.VIP));
            await refreshOrder(orderId);
        });
    }

    return {
        laundryOrders,
        washingCycles,
        errors,
        laundryOrdersLoaded,
        washingCyclesLoaded,
        ordersByStage,
        vipOrders,
        atRiskOrders,
        summary,
        clearErrors,
        fetchLaundryOrders,
        fetchWashingCycles,
        findCompatibleWashingCycles,
        getLaundryOrderById,
        getWashingCycleById,
        isOrderReceived,
        receiveOrder,
        classifyOrder,
        assignWashingCycle,
        assignResource,
        advanceStage,
        prioritizeOrder
    };
});

export default useLaundryOperationStore;
