import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {PaymentsApi} from "../infrastructure/payments-api.js";
import {PaymentAssembler} from "../infrastructure/payment-assembler.js";
import {PaymentStatus} from "../domain/model/payment-status.js";

const paymentsApi = new PaymentsApi();

export const usePaymentsStore = defineStore("payments", () => {
    const payments = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    const summary = computed(() => ({
        paid: payments.value.filter((payment) => payment.status === PaymentStatus.PAID).length,
        pending: payments.value.filter((payment) => payment.status === PaymentStatus.PENDING).length,
        cancelled: payments.value.filter((payment) => payment.status === PaymentStatus.CANCELLED).length,
    }));

    async function fetchPayments() {
        loading.value = true;
        errors.value = [];
        try {
            const response = await paymentsApi.getPayments();
            payments.value = PaymentAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    return {payments, loading, errors, summary, fetchPayments};
});