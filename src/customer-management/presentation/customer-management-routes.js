const customerList = () => import("./views/customer-list.vue");

export default [
    {
        path: "",
        name: "customer-list",
        component: customerList,
        meta: {titleKey: "customers.title"}
    }
];
