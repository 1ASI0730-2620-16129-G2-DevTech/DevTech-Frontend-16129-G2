import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {LaundryOperationsApi} from "@/laundry-operations/infrastructure/laundry-operations-api.js";
import {LaundryOrderAssembler} from "@/laundry-operations/infrastructure/laundry-order.assembler.js";
import {WashingCycleAssembler} from "@/laundry-operations/infrastructure/washing-cycle.assembler.js";
import {LaundryOrder} from "@/laundry-operations/domain/model/laundry-order.entity.js";
import {PROCESSING_STAGES, ProcessingStage} from "@/laundry-operations/domain/model/processing-stage.js";
import {Priority} from "@/laundry-operations/domain/model/priority.js";
import useResourceStore from "@/laundry-operations/application/resource.store.js";
import {generateUuid} from "@/shared/domain/model/uuid.js";
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

    // ---------- Internal helpers ----------

    function requireOrder(id) {
        const order = getLaundryOrderById(id);
        if (!order) throw new ValidationError(`Laundry order not found: ${id}`);
        return new LaundryOrder({...order});
    }

    async function persistOrder(order) {
        const response = await laundryOperationsApi.updateLaundryOrder(
            order.id, LaundryOrderAssembler.toResourceFromEntity(order));
        const saved = LaundryOrderAssembler.toEntityFromResource(response.data);
        const index = laundryOrders.value.findIndex(o => o.id === saved.id);
        if (index !== -1) laundryOrders.value[index] = saved;
        return saved;
    }

    // ---------- Use cases ----------

    /** receiveOrder(orderId): creates the laundry order for an order coming from Order Management. */
    function receiveOrder(orderId, expectedCompletion = null) {
        return run(async () => {
            if (!orderId) throw new ValidationError("A laundry order must reference an order");
            const order = new LaundryOrder({id: generateUuid(), orderId, expectedCompletion});
            const response = await laundryOperationsApi.createLaundryOrder(
                LaundryOrderAssembler.toResourceFromEntity(order));
            laundryOrders.value.push(LaundryOrderAssembler.toEntityFromResource(response.data));
        });
    }

    /** classifyOrder(orderId): RECEPTION -> CLASSIFICATION. */
    function classifyOrder(orderId) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.advanceStage(ProcessingStage.CLASSIFICATION);
            await persistOrder(order);
        });
    }

    /** assignWashingCycle(orderId, cycleId) */
    function assignWashingCycle(orderId, cycleId) {
        return run(async () => {
            const order = requireOrder(orderId);
            if (!getWashingCycleById(cycleId)) throw new ValidationError(`Washing cycle not found: ${cycleId}`);
            order.assignWashingCycle(cycleId);
            await persistOrder(order);
        });
    }

    /**
     * assignResource(orderId, resourceId): reserves the resource and links it to the order.
     * If the order already had another resource, that one is released.
     */
    function assignResource(orderId, resourceId) {
        return run(async () => {
            const order = requireOrder(orderId);
            const previousResourceId = order.resourceId;
            if (previousResourceId === resourceId) return;

            order.assignResource(resourceId);
            await resourceStore.assignResource(resourceId);
            try {
                await persistOrder(order);
            } catch (error) {
                await resourceStore.releaseResource(resourceId).catch(() => {});
                throw error;
            }
            if (previousResourceId) await resourceStore.releaseResource(previousResourceId);
        });
    }

    /** advanceStage(orderId, stage): when the order becomes READY, its resource is released. */
    function advanceStage(orderId, stage = null) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.advanceStage(stage);
            const saved = await persistOrder(order);
            if (saved.isReady && saved.resourceId) await resourceStore.releaseResource(saved.resourceId);
        });
    }

    /** prioritizeOrder(orderId): marks the order as VIP. */
    function prioritizeOrder(orderId) {
        return run(async () => {
            const order = requireOrder(orderId);
            order.setPriority(Priority.VIP);
            await persistOrder(order);
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
        receiveOrder,
        classifyOrder,
        assignWashingCycle,
        assignResource,
        advanceStage,
        prioritizeOrder
    };
});

export default useLaundryOperationStore;
