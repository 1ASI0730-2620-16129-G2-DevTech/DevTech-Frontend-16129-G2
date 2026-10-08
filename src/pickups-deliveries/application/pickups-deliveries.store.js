import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {PickupsDeliveriesApi} from "@/pickups-deliveries/infrastructure/pickups-deliveries-api.js";
import {DeliveryAssembler} from "@/pickups-deliveries/infrastructure/delivery.assembler.js";

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

    return {
        deliveries,
        errors,
        deliveriesLoaded,
        deliveriesCount,
        fetchDeliveries
    };
});

export default usePickupsDeliveriesStore;