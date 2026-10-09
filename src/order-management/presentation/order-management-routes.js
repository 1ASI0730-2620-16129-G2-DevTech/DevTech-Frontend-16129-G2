const orderList = () => import("./views/order-list.vue");

export default [
    {
        path: "",
        name: "order-list",
        component: orderList,
        meta: {titleKey: "orders.title"}
    }
];
