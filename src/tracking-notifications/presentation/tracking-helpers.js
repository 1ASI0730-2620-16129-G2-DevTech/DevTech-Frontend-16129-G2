/**
 * Processing stages of a WashTrack order, in the order they occur.
 * Each key has a translation under `tracking.stages.<key>`.
 */
export const ORDER_STAGES = ['received', 'sorting', 'washing', 'drying-ironing', 'packaging', 'ready'];

/**
 * Format an order id as the order code shown to customers (e.g. #WT-001).
 * @param {number|string} orderId - The order identifier.
 * @returns {string} The order code.
 */
export function formatOrderCode(orderId) {
    return `#WT-${String(orderId).padStart(3, '0')}`;
}

/**
 * Format an ISO date string for display.
 * @param {string} value - The ISO date string.
 * @returns {string} The localized date and time, or an empty string.
 */
export function formatDateTime(value) {
    return value ? new Date(value).toLocaleString() : '';
}