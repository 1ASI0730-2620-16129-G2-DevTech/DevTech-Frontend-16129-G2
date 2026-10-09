/**
 * Sidebar navigation, grouped as in the WashTrack mockups.
 * - `labelKey` is a key of the i18n locales.
 * - `to` is the route path. Until a bounded context registers its route, the path shows the "page not found" view.
 */
export const navigationGroups = [
    {
        labelKey: null,
        items: [
            {labelKey: 'option.dashboard', to: '/home'}
        ]
    },
    {
        labelKey: 'group.operations',
        items: [
            {labelKey: 'option.orders', to: '/orders'},
            {labelKey: 'option.customers', to: '/customers'},
            {labelKey: 'option.laundry', to: '/laundry-operations'},
            {labelKey: 'option.garments', to: '/garments'},
            {labelKey: 'option.services', to: '/services'},
            {labelKey: 'option.payments', to: '/payments'},
            {labelKey: 'option.pickups-deliveries', to: '/pickups-deliveries'}
        ]
    },
    {
        labelKey: 'group.monitoring',
        items: [
            {labelKey: 'option.iot-monitoring', to: '/iot-monitoring'},
            {labelKey: 'option.alerts', to: '/alerts'}
        ]
    }
];
