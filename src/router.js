import {createRouter, createWebHistory} from "vue-router";
import i18n from "@/i18n.js";
import trackingNotificationsRoutes from "@/tracking-notifications/presentation/tracking-notifications-routes.js";
import pickupsDeliveriesRoutes from "@/pickups-deliveries/presentation/pickups-deliveries-routes.js";

const routes =
    [
        // Nested routes for tracking & notifications
        {
            path: '/tracking-notifications',
            name: 'tracking-notifications',
            children: trackingNotificationsRoutes
        },
        // Nested routes for pickups & deliveries
        {
            path: '/pickups-deliveries',
            name: 'pickups-deliveries',
            children: pickupsDeliveriesRoutes
        },
        {
            path: '/',
            redirect: '/tracking-notifications/trackings'
        },
        {
            path: '/:pageMatch(.*)*',
            redirect: '/'
        },
    ];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to) => {
    const baseTitle = 'WashTrack';
    const title = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : '';
    document.title = title ? `${baseTitle} - ${title}` : baseTitle;
    return true;
});

export default router;