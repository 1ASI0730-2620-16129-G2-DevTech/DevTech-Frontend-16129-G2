import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {PaymentsApi} from "../infrastructure/payments-api.js";
import {PaymentAssembler} from "../infrastructure/payment-assembler.js";
import {PaymentStatus} from "../domain/model/payment-status.js";
import {Payment} from "../domain/model/payment.js";
const paymentsApi = new PaymentsApi();

/** Next free payment code (PG015 after PG014), read from the API so it is right even before the list loads. */
async function nextPaymentCode() {
    const response = await paymentsApi.getPayments();
    const highest = response.data
        .map((resource) => /^PG(\d+)$/.exec(String(resource.id))?.[1])
        .filter(Boolean)
        .reduce((max, digits) => Math.max(max, Number(digits)), 0);
    return `PG${String(highest + 1).padStart(3, "0")}`;
}

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

    /**
     * Registers the payment of an order. The amount starts at 0 until the
     * laundry prices the order.
     * @returns {Promise<Payment|null>}
     */
    async function createPayment({orderId, customerId, customerName, paymentMethod, status, orderDate, amount = 0}) {
        errors.value = [];
        try {
            const payment = new Payment({
                id: await nextPaymentCode(),
                orderId,
                customerId,
                customerName,
                amount,
                paymentMethod,
                status,
                paidAt: status === PaymentStatus.PAID ? new Date() : null,
                orderDate
            });
            const response = await paymentsApi.createPayment(PaymentAssembler.toResourceFromEntity(payment));
            const created = PaymentAssembler.toEntityFromResource(response.data);
            payments.value = [...payments.value, created];
            return created;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    return {payments, loading, errors, summary, fetchPayments, createPayment};
});