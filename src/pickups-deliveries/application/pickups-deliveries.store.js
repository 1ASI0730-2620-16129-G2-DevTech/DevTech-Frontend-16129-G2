import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {PickupsDeliveriesApi} from "@/pickups-deliveries/infrastructure/pickups-deliveries-api.js";
import {DeliveryAssembler} from "@/pickups-deliveries/infrastructure/delivery.assembler.js";
import {Delivery, DeliveryStatus, DeliveryType} from "@/pickups-deliveries/domain/model/delivery.entity.js";

const pickupsDeliveriesApi = new PickupsDeliveriesApi();

const usePickupsDeliveriesStore = defineStore("pickupsDeliveries", () => {
    const deliveries = ref([]);

    const errors = ref([]);

    const deliveriesLoaded = ref(false);

    const deliveriesCount = computed(() => {
        return deliveriesLoaded.value ? deliveries.value.length : 0;
    });

    function fetchDeliveries() {
        pickupsDeliveriesApi.getDeliveries().then((response) => {
            deliveries.value = DeliveryAssembler.toEntitiesFromResponse(response);
            deliveriesLoaded.value = true;
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    /**
     * Schedules the home delivery of an order: the clean garments go back to the customer's address.
     * The driver stays unassigned until the laundry assigns one.
     * @returns {Promise<Delivery|null>} The scheduled delivery, or null when it could not be registered.
     */
    async function scheduleDelivery({orderId, customerName, address, scheduledAt}) {
        try {
            const delivery = new Delivery({
                orderId,
                type: DeliveryType.DELIVERY,
                customerName,
                address,
                status: DeliveryStatus.SCHEDULED,
                scheduledAt
            });
            const response = await pickupsDeliveriesApi.createDelivery(DeliveryAssembler.toResourceFromEntity(delivery));
            const scheduled = DeliveryAssembler.toEntityFromResource(response.data);
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
        scheduleDelivery
    };
});

export default usePickupsDeliveriesStore;