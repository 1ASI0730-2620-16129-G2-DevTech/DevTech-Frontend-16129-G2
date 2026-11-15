import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {PickupsDeliveriesApi} from "@/pickups-deliveries/infrastructure/pickups-deliveries-api.js";
import {DeliveryAssembler} from "@/pickups-deliveries/infrastructure/delivery.assembler.js";
import {Delivery, DeliveryStatus, DeliveryType} from "@/pickups-deliveries/domain/model/delivery.entity.js";
import {customerGuidToCode} from "@/shared/infrastructure/customer-id-translator.js";

const pickupsDeliveriesApi = new PickupsDeliveriesApi();

/** "2026-11-20" (backend DateOnly) as the ISO string of that local day. */
function fromDateOnly(value) {
    if (!value) return "";
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day).toISOString();
}

const usePickupsDeliveriesStore = defineStore("pickupsDeliveries", () => {
    const deliveries = ref([]);

    const errors = ref([]);

    const deliveriesLoaded = ref(false);

    const deliveriesCount = computed(() => {
        return deliveriesLoaded.value ? deliveries.value.length : 0;
    });

    /**
     * The backend keeps the pickups and deliveries of each order, so they are read order by order
     * (orders of the current laundry). The customer name and the date come from the order.
     */
    async function fetchDeliveries() {
        try {
            const [ordersResponse, customersResponse] = await Promise.all([
                pickupsDeliveriesApi.getOrders(),
                pickupsDeliveriesApi.getCustomers()
            ]);
            const customerNames = new Map(customersResponse.data.map(customer => [customer.id, customer.fullName]));
            const perOrder = await Promise.all(ordersResponse.data.map(async (order) => {
                const resources = await pickupsDeliveriesApi.getDeliveriesByOrder(order.id);
                const customerName = customerNames.get(customerGuidToCode(order.customerId)) ?? "";
                // Both the store pickup and the home delivery happen on the estimated delivery date of the order.
                return resources.map(resource => DeliveryAssembler.toEntityFromResource(resource, {
                    customerName,
                    scheduledAt: fromDateOnly(order.estimatedDeliveryDate)
                }));
            }));
            deliveries.value = perOrder.flat().sort((a, b) => a.id - b.id);
            deliveriesLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * Schedules the home delivery of an order: the clean garments go back to the customer's address.
     * The backend only accepts it for orders with the home delivery method.
     * @returns {Promise<Delivery|null>} The scheduled delivery, or null when it could not be registered.
     */
    function scheduleDelivery(request) {
        return schedule({...request, type: DeliveryType.DELIVERY});
    }

    /**
     * Schedules the store pickup of an order: the customer collects the clean garments at the laundry,
     * so the address is the one of the laundry. The backend accepts one pickup per order, whatever its status.
     * @returns {Promise<Delivery|null>} The scheduled pickup, or null when it could not be registered.
     */
    function schedulePickup(request) {
        return schedule({...request, type: DeliveryType.PICKUP});
    }

    /** The driver stays unassigned until the laundry assigns one. */
    async function schedule({orderId, customerName, address, scheduledAt, type}) {
        try {
            const delivery = new Delivery({
                orderId,
                type,
                customerName,
                address,
                status: DeliveryStatus.SCHEDULED,
                scheduledAt
            });
            const response = await pickupsDeliveriesApi.createDelivery(DeliveryAssembler.toScheduleResource(delivery));
            const scheduled = DeliveryAssembler.toEntityFromResource(response.data, {customerName, scheduledAt});
            if (deliveriesLoaded.value) deliveries.value.push(scheduled);
            return scheduled;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    return {
        deliveries,
        errors,
        deliveriesLoaded,
        deliveriesCount,
        fetchDeliveries,
        scheduleDelivery,
        schedulePickup
    };
});

export default usePickupsDeliveriesStore;
