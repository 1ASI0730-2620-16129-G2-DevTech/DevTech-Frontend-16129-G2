const paymentCatalog = () => import("./views/payment-catalog.vue");

export default [
    {
        path: "",
        name: "payments-catalog",
        component: paymentCatalog,
        meta: {titleKey: "payments.title"}
    }
];