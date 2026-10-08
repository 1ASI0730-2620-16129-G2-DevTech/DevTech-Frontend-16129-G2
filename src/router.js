import {createRouter, createWebHistory} from "vue-router";
import i18n from "@/i18n.js";
import trackingNotificationsRoutes from "@/tracking-notifications/presentation/tracking-notifications-routes.js";
import pickupsDeliveriesRoutes from "@/pickups-deliveries/presentation/pickups-deliveries-routes.js";
import pageNotFound from "@/shared/presentation/views/page-not-found.vue";
import about from "@/shared/presentation/views/about.vue";
import laundryOperationsRoutes from "@/laundry-operations/presentation/laundry-operations-routes.js";
import Home from "@/shared/presentation/views/home.vue";
import LoginView from "@/iam/presentation/views/login-view.vue";

const routes =
    [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { titleKey: 'login.title', hideLayout: true }
        },
        {
            path: '/home',
            name: 'home',
            component: Home,
            meta: { titleKey: 'option.dashboard' }
        },
        {
            path: '/about',
            name: 'about',
            component: about,
            meta: { titleKey: 'option.about' }
        },
        // Nested routes of each bounded context
        {
            path: '/laundry-operations',
            name: 'laundry-operations',
            redirect: '/laundry-operations/production-board',
            children: laundryOperationsRoutes
        },
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/:pageMatch(.*)*',
            name: 'not-found',
            component: pageNotFound,
            meta: { titleKey: 'page-not-found.title' }
        },
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