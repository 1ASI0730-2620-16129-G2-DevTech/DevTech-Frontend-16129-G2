import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {CustomersApi} from "../infrastructure/customers-api.js";
import {CustomerAssembler} from "../infrastructure/customer-assembler.js";
import {Customer} from "../domain/model/customer.js";
import {mergeSort} from "@/shared/domain/model/merge-sort.js";

const customersApi = new CustomersApi();

export const useCustomersStore = defineStore("customers", () => {
    const customers = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    /** Newest customers first, as in the mockup. */
    const sortedCustomers = computed(() =>
        mergeSort(customers.value, (a, b) => b.id.localeCompare(a.id, undefined, {numeric: true})));

    async function fetchCustomers() {
        loading.value = true;
        errors.value = [];
        try {
            const response = await customersApi.getCustomers();
            customers.value = CustomerAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Registers a new customer with the next free CL code.
     * @returns {Promise<Customer|null>}
     */
    async function createCustomer({fullName, phone, documentType, documentNumber, address}) {
        errors.value = [];
        try {
            const id = await customersApi.getNextCustomerCode();
            const customer = new Customer({id, fullName, phone, documentType, documentNumber, address});
            const response = await customersApi.createCustomer(CustomerAssembler.toResourceFromEntity(customer));
            const created = CustomerAssembler.toEntityFromResource(response.data);
            customers.value = [...customers.value, created];
            return created;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    return {customers, sortedCustomers, loading, errors, fetchCustomers, createCustomer};
});
