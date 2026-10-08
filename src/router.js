import {createRouter, createWebHistory} from "vue-router";
import i18n from "@/i18n.js";
import Home from "@/shared/presentation/views/home.vue";

const about = () => import('./shared/presentation/views/about.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

/*
 * Each route declares `meta.titleKey`: an i18n key used for the page title (topbar, breadcrumb and document title).
 * Each bounded context exposes its routes in `<context>/presentation/<context>-routes.js`
 * and registers them below as nested routes.
 */
const routes =
    [
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
        // Nested routes of each bounded context go here, for example:
        // {
        //     path: '/laundry-operations',
        //     name: 'laundry-operations',
        //     children: laundryOperationsRoutes
        // },
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/:pageMatch(.*)*',
            name: 'not-found',
            component: pageNotFound,
            meta: { titleKey: 'page-not-found.title' }
        },
    ];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    const baseTitle = 'WashTrack';
    document.title = to.meta.titleKey ? `${baseTitle} - ${i18n.global.t(to.meta.titleKey)}` : baseTitle;
    // When IAM is implemented, use:
    // return authenticationGuard(to, from);
    // if not, use:
    return true;
});

export default router;
