import {ref} from "vue";
import {defineStore} from "pinia";
import {DashboardApi} from "../infrastructure/dashboard-api.js";

const dashboardApi = new DashboardApi();

/** Read model of the dashboard: the few fields each chart needs from orders, payments and customers. */
export const useDashboardStore = defineStore("dashboard", () => {
    const orders = ref([]);
    const payments = ref([]);
    const customersCount = ref(0);
    const loading = ref(false);
    const errors = ref([]);

    async function fetchDashboard() {
        loading.value = true;
        errors.value = [];
        try {
            const [ordersResponse, paymentsResponse, customersResponse] = await Promise.all([
                dashboardApi.getOrders(), dashboardApi.getPayments(), dashboardApi.getCustomers()
            ]);
            orders.value = ordersResponse.data.map((resource) => ({
                serviceType: resource.serviceType,
                status: resource.status,
                createdAt: new Date(resource.createdAt),
            }));
            payments.value = paymentsResponse.data.map((resource) => ({
                amount: Number(resource.amount),
                status: resource.status,
                paidAt: resource.paidAt ? new Date(resource.paidAt) : null,
            }));
            customersCount.value = customersResponse.data.length;
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    return {orders, payments, customersCount, loading, errors, fetchDashboard};
});
