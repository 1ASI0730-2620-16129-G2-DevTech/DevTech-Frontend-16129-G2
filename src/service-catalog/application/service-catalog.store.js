import {ref} from "vue";
import {defineStore} from "pinia";
import {ServiceCatalogApi} from "../infrastructure/service-catalog-api.js";
import {CatalogAssembler} from "../infrastructure/catalog-assembler.js";
import {LaundryService} from "../domain/model/laundry-service.js";
import {Garment} from "../domain/model/garment.js";

const catalogApi = new ServiceCatalogApi();

/** Next free code for a prefix, e.g. S115 after S114. */
function nextCode(prefix, items) {
    const highest = items
        .map((item) => Number(item.id.slice(prefix.length)))
        .reduce((max, number) => Math.max(max, number), 0);
    return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

export const useServiceCatalogStore = defineStore("service-catalog", () => {
    const services = ref([]);
    const garments = ref([]);
    const orders = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    async function load(request, assign) {
        loading.value = true;
        errors.value = [];
        try {
            const [response, ordersResponse] = await Promise.all([request(), catalogApi.getOrders()]);
            assign(response);
            orders.value = ordersResponse.data.map((resource) => CatalogAssembler.toOrderDemandFromResource(resource));
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    function fetchServices() {
        return load(() => catalogApi.getServices(), (response) => {
            services.value = response.data.map((resource) => CatalogAssembler.toServiceFromResource(resource));
        });
    }

    function fetchGarments() {
        return load(() => catalogApi.getGarments(), (response) => {
            garments.value = response.data.map((resource) => CatalogAssembler.toGarmentFromResource(resource));
        });
    }

    /** @returns {Promise<LaundryService|null>} */
    async function createService(fields) {
        errors.value = [];
        try {
            const service = new LaundryService({id: nextCode(LaundryService.PREFIX, services.value), ...fields});
            const response = await catalogApi.createService(CatalogAssembler.toResourceFromService(service));
            const created = CatalogAssembler.toServiceFromResource(response.data);
            services.value = [...services.value, created];
            return created;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    /** @returns {Promise<Garment|null>} */
    async function createGarment(fields) {
        errors.value = [];
        try {
            const garment = new Garment({id: nextCode(Garment.PREFIX, garments.value), ...fields});
            const response = await catalogApi.createGarment(CatalogAssembler.toResourceFromGarment(garment));
            const created = CatalogAssembler.toGarmentFromResource(response.data);
            garments.value = [...garments.value, created];
            return created;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    return {services, garments, orders, loading, errors, fetchServices, fetchGarments, createService, createGarment};
});
