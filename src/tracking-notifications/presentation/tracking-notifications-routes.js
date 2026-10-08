// Lazy-loaded components for tracking & notifications routes
const orderTrackingList = () => import('./views/order-tracking-list.vue');
const orderTrackerView = () => import('@/tracking-notifications/presentation/views/order-tracker-view.vue');

const trackingNotificationsRoutes = [
    {
        path: 'trackings',
        name: 'tracking-notifications-trackings',
        component: orderTrackingList,
        meta: { titleKey: 'routes.trackings' }
    },
    {
        path: 'trackings/:orderId',
        name: 'tracking-notifications-tracker',
        component: orderTrackerView,
        meta: { titleKey: 'routes.tracker' }
    }
];

export default trackingNotificationsRoutes;