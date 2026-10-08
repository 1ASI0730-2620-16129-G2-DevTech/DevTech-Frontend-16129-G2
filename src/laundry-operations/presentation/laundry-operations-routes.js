// Lazy-loaded components for laundry operations routes
const productionBoard = () => import('@/laundry-operations/presentation/views/production-board.vue');
const laundryResourceList = () => import('@/laundry-operations/presentation/views/laundry-resource-list.vue');
const washingCycleList = () => import('@/laundry-operations/presentation/views/washing-cycle-list.vue');

const laundryOperationsRoutes = [
    {
        path: 'production-board',
        name: 'laundry-operations-production-board',
        component: productionBoard,
        meta: { titleKey: 'laundry-operations.board.title' }
    },
    {
        path: 'resources',
        name: 'laundry-operations-resources',
        component: laundryResourceList,
        meta: { titleKey: 'laundry-operations.resources.title' }
    },
    {
        path: 'washing-cycles',
        name: 'laundry-operations-washing-cycles',
        component: washingCycleList,
        meta: { titleKey: 'laundry-operations.cycles.title' }
    }
];

export default laundryOperationsRoutes;
