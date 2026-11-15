import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {PaymentsApi} from "../infrastructure/payments-api.js";
import {PaymentAssembler} from "../infrastructure/payment-assembler.js";
import {PaymentStatus} from "../domain/model/payment-status.js";
import {PaymentMethod} from "../domain/model/payment-method.js";

const paymentsApi = new PaymentsApi();

/**
 * Card token sent to the payment gateway. The backend simulates the provider:
 * every token is approved unless it contains "declined".
 * TODO: take it from the card form once the web app tokenizes real cards.
 */
const SIMULATED_CARD_TOKEN = "tok_washtrack_web_app";

export const usePaymentsStore = defineStore("payments", () => {
    const payments = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    const summary = computed(() => ({
        completed: payments.value.filter((payment) => payment.status === PaymentStatus.COMPLETED).length,
        pending: payments.value.filter((payment) => payment.status === PaymentStatus.PENDING).length,
        failed: payments.value.filter((payment) => payment.status === PaymentStatus.FAILED).length,
    }));

    function replaceInState(payment) {
        const index = payments.value.findIndex((existing) => existing.id === payment.id);
        payments.value = index === -1
            ? [...payments.value, payment]
            : payments.value.map((existing) => existing.id === payment.id ? payment : existing);
    }

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
     * Registers and charges the payment of an order. The backend leaves an approved payment
     * PENDING; with `confirm` it is confirmed right away (COMPLETED), e.g. when the customer paid at the counter.
     * @param {Object} request
     * @param {string} request.orderId - Order id (UUID).
     * @param {string} request.customerId - Customer code, e.g. CL005.
     * @param {number} [request.amount] - 0 until the laundry prices the order.
     * @param {string} [request.currency]
     * @param {string} [request.paymentMethod] - One of PaymentMethod; card by default.
     * @param {boolean} [request.confirm]
     * @returns {Promise<import("../domain/model/payment.js").Payment|null>}
     */
    async function createPayment({orderId, customerId, amount = 0, currency = "PEN", paymentMethod = PaymentMethod.CARD,
                                     confirm = false}) {
        errors.value = [];
        try {
            const response = await paymentsApi.createPayment(PaymentAssembler.toCreateResource({
                orderId, customerId, amount, currency, paymentMethod, cardToken: SIMULATED_CARD_TOKEN
            }));
            let payment = PaymentAssembler.toEntityFromResource(response.data);
            if (confirm && payment.isPending()) {
                const confirmed = await paymentsApi.confirmPayment(payment.id);
                payment = PaymentAssembler.toEntityFromResource(confirmed.data);
            }
            replaceInState(payment);
            return payment;
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    /**
     * Confirms a pending payment in the backend (PENDING -> COMPLETED) and keeps the list up to date.
     * A failure is returned as null (and logged) without touching `errors`, which belongs to loading the list.
     * @returns {Promise<import("../domain/model/payment.js").Payment|null>}
     */
    async function confirmPayment(paymentId) {
        try {
            const response = await paymentsApi.confirmPayment(paymentId);
            const payment = PaymentAssembler.toEntityFromResource(response.data);
            replaceInState(payment);
            return payment;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return {payments, loading, errors, summary, fetchPayments, createPayment, confirmPayment};
});
