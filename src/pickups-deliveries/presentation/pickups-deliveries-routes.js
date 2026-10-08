// Lazy-loaded components for pickups & deliveries routes
const deliveryList = () => import('./views/delivery-list.vue');

const pickupsDeliveriesRoutes = [
    {
        path: 'deliveries',
        name: 'pickups-deliveries-deliveries',
        component: deliveryList,
        meta: { titleKey: 'routes.deliveries' }
    }
];

export default pickupsDeliveriesRoutes;