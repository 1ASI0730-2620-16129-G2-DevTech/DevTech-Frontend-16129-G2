const HOUR = 60 * 60 * 1000;

/**
 * Time windows offered by the "most requested" chart, split into equal buckets.
 */
export const DemandPeriod = Object.freeze({
    HOUR: { key: "hour", durationMs: HOUR, buckets: 12 },
    DAY: { key: "day", durationMs: 24 * HOUR, buckets: 12 },
    WEEK: { key: "week", durationMs: 7 * 24 * HOUR, buckets: 7 },
    MONTH: { key: "month", durationMs: 30 * 24 * HOUR, buckets: 15 },
});

/**
 * Finds the most requested item inside the period and its demand per bucket.
 * @param {import("./catalog-item.js").CatalogItem[]} items - Services or garments, each with demandIn(order).
 * @param {{createdAt: Date}[]} orders
 * @param {typeof DemandPeriod[keyof typeof DemandPeriod]} period
 * @param {Date} [now]
 * @returns {{item: Object|null, total: number, series: number[]}}
 */
export function mostRequested(items, orders, period, now = new Date()) {
    const start = now.getTime() - period.durationMs;
    const bucketMs = period.durationMs / period.buckets;
    const inPeriod = orders.filter((order) => {
        const time = order.createdAt.getTime();
        return time > start && time <= now.getTime();
    });

    let best = { item: null, total: 0, series: new Array(period.buckets).fill(0) };
    for (const item of items) {
        const series = new Array(period.buckets).fill(0);
        for (const order of inPeriod) {
            const bucket = Math.min(period.buckets - 1, Math.floor((order.createdAt.getTime() - start) / bucketMs));
            series[bucket] += item.demandIn(order);
        }
        const total = series.reduce((sum, value) => sum + value, 0);
        if (total > best.total) best = { item, total, series };
    }
    return best;
}
