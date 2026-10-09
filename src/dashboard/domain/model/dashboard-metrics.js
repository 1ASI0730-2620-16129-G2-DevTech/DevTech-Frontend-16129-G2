import { mergeSort } from "../../../shared/domain/model/merge-sort.js";

/**
 * Pure calculations behind the dashboard. Orders, payments and customers arrive
 * already read from their own bounded contexts; nothing here changes them.
 *
 * order:   { serviceType: string, status: string, createdAt: Date }
 * payment: { amount: number, status: string, paidAt: Date|null }
 */

// Order Management statuses grouped the way the dashboard cards read them.
const PENDING_STATUSES = ["CREATED", "RECEIVED"];
const IN_PROCESS_STATUSES = ["CLASSIFIED", "IN_PROCESS"];
const READY_STATUSES = ["READY"];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function countWhere(orders, statuses) {
    return orders.filter((order) => statuses.includes(order.status)).length;
}

/**
 * Figures for the cards at the top. Both are totals, not daily figures (the cards keep
 * the mockup titles "Pedidos del día" and "Ingresos hoy"):
 * "orders" counts every order and "revenue" adds up every payment already paid.
 */
export function summarize({ orders, payments, customersCount }) {
    const revenue = payments
        .filter((payment) => payment.status === "paid")
        .reduce((total, payment) => total + payment.amount, 0);
    return {
        orders: orders.length,
        inProcess: countWhere(orders, IN_PROCESS_STATUSES),
        ready: countWhere(orders, READY_STATUSES),
        pending: countWhere(orders, PENDING_STATUSES),
        revenue: Math.round(revenue * 100) / 100,
        customers: customersCount,
    };
}

/** The last `days` calendar days, oldest first, ending today. */
function lastDays(days, now) {
    const today = startOfDay(now);
    return Array.from({ length: days }, (_, index) => new Date(today.getTime() - (days - 1 - index) * DAY_MS));
}

/**
 * Adds `valueOf(entry)` into the day each entry falls on.
 * @returns {{date: Date, value: number}[]}
 */
function perDay(entries, dateOf, valueOf, days, now) {
    const series = lastDays(days, now).map((date) => ({ date, value: 0 }));
    const first = series[0].date.getTime();
    for (const entry of entries) {
        const date = dateOf(entry);
        if (!date) continue;
        const index = Math.round((startOfDay(date).getTime() - first) / DAY_MS);
        if (index >= 0 && index < series.length) series[index].value += valueOf(entry);
    }
    return series;
}

export function ordersPerDay(orders, days = 7, now = new Date()) {
    return perDay(orders, (order) => order.createdAt, () => 1, days, now);
}

export function revenuePerDay(payments, days = 7, now = new Date()) {
    const paid = payments.filter((payment) => payment.status === "paid");
    return perDay(paid, (payment) => payment.paidAt, (payment) => payment.amount, days, now)
        .map((point) => ({ ...point, value: Math.round(point.value * 100) / 100 }));
}

/**
 * Service types ordered from most to least requested (Merge Sort, so ties keep
 * the order in which each service first appeared).
 * @returns {{serviceType: string, count: number}[]}
 */
export function topServices(orders, limit = 4) {
    const counts = new Map();
    for (const order of orders) {
        counts.set(order.serviceType, (counts.get(order.serviceType) ?? 0) + 1);
    }
    const ranking = [...counts].map(([serviceType, count]) => ({ serviceType, count }));
    return mergeSort(ranking, (a, b) => b.count - a.count).slice(0, limit);
}

/**
 * How many orders are in each status, in the order of `statuses`. Statuses with no orders are kept (count 0).
 * @param {string[]} statuses
 * @returns {{status: string, count: number}[]}
 */
export function statusDistribution(orders, statuses) {
    return statuses.map((status) => ({ status, count: orders.filter((order) => order.status === status).length }));
}
