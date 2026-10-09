import { defineStore } from "pinia";
import { ref } from "vue";
import { CustomerRepositoryImpl } from "../infrastructure/customer-repository-impl.js";
import { OrderRepositoryImpl } from "../infrastructure/order-repository-impl.js";
import { OrderService } from "./order-service.js";

const orderService = new OrderService({
    orderRepository: new OrderRepositoryImpl(),
    customerRepository: new CustomerRepositoryImpl(),
});

/**
 * Pinia store with the order use cases and their state.
 * Orders and items are frozen domain objects, so Vue keeps them as they are.
 */
export const useOrderStore = defineStore("order", () => {
    /** @type {import("vue").Ref<import("../domain/model/order.js").Order[]>} */
    const orders = ref([]);
    /** @type {import("vue").Ref<import("../domain/model/order.js").Order|null>} */
    const currentOrder = ref(null);
    /** @type {import("vue").Ref<import("../domain/model/customer.js").Customer[]>} */
    const customers = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    /** Runs a use case, tracking loading and errors. Returns null when it fails. */
    async function run(useCase) {
        errors.value = [];
        loading.value = true;
        try {
            return await useCase();
        } catch (error) {
            console.error(error);
            errors.value.push(error);
            return null;
        } finally {
            loading.value = false;
        }
    }

    function replaceInState(order) {
        const index = orders.value.findIndex((existing) => existing.id === order.id);
        if (index === -1) orders.value.push(order);
        else orders.value.splice(index, 1, order);
        if (currentOrder.value?.id === order.id) currentOrder.value = order;
    }

    async function refreshOrder(orderId) {
        replaceInState(await orderService.getOrderById(orderId));
    }

    function fetchAllOrders() {
        return run(async () => {
            orders.value = await orderService.getAllOrders();
            return orders.value;
        });
    }

    function fetchCustomers() {
        return run(async () => {
            customers.value = await orderService.getAllCustomers();
            return customers.value;
        });
    }

    function fetchOrdersByCustomer(customerId) {
        return run(async () => {
            orders.value = await orderService.getOrdersByCustomer(customerId);
            return orders.value;
        });
    }

    function fetchOrderById(id) {
        return run(async () => {
            currentOrder.value = await orderService.getOrderById(id);
            return currentOrder.value;
        });
    }

    /**
     * Places a new order from a plain request (see OrderService.placeOrder).
     * @returns {Promise<import("../domain/model/order.js").Order|null>}
     */
    function placeOrder(request) {
        return run(async () => {
            const order = await orderService.placeOrder(request);
            replaceInState(order);
            return order;
        });
    }

    function createOrder(order) {
        return run(async () => {
            const created = await orderService.createOrder(order);
            replaceInState(created);
            return created;
        });
    }

    function updateOrder(order) {
        return run(async () => {
            const updated = await orderService.updateOrder(order);
            replaceInState(updated);
            return updated;
        });
    }

    function changeOrderStatus(id, status) {
        return run(async () => {
            const updated = await orderService.changeOrderStatus(id, status);
            replaceInState(updated);
            return updated;
        });
    }

    function addItem(orderId, item) {
        return run(async () => {
            const added = await orderService.addItem(orderId, item);
            await refreshOrder(orderId);
            return added;
        });
    }

    function updateItem(orderId, item) {
        return run(async () => {
            const updated = await orderService.updateItem(orderId, item);
            await refreshOrder(orderId);
            return updated;
        });
    }

    function removeItem(orderId, itemId) {
        return run(async () => {
            await orderService.removeItem(orderId, itemId);
            await refreshOrder(orderId);
            return true;
        });
    }

    return {
        orders,
        currentOrder,
        customers,
        loading,
        errors,
        fetchAllOrders,
        fetchCustomers,
        fetchOrdersByCustomer,
        fetchOrderById,
        placeOrder,
        createOrder,
        updateOrder,
        changeOrderStatus,
        addItem,
        updateItem,
        removeItem,
    };
});
