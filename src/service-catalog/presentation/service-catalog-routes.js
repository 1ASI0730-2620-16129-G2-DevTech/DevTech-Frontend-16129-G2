const serviceList = () => import("./views/service-list.vue");
const garmentList = () => import("./views/garment-list.vue");

export const serviceRoutes = [
    {
        path: "",
        name: "service-list",
        component: serviceList,
        meta: {titleKey: "services.title"}
    }
];

export const garmentRoutes = [
    {
        path: "",
        name: "garment-list",
        component: garmentList,
        meta: {titleKey: "garments.title"}
    }
];
