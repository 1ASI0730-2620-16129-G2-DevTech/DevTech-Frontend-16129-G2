import {DeliveryStatus} from "@/pickups-deliveries/domain/model/delivery.entity.js";

/**
 * Format an ISO date string for display.
 * @param {string} value - The ISO date string.
 * @returns {string} The localized date and time, or an empty string.
 */
export function formatDateTime(value) {
    return value ? new Date(value).toLocaleString() : '';
}

/**
 * Tag severity used to display a delivery status.
 * @param {string} status - One of the DeliveryStatus values.
 * @returns {string} The PrimeVue tag severity.
 */
export function getStatusSeverity(status) {
    if (status === DeliveryStatus.COMPLETED) return 'success';
    if (status === DeliveryStatus.CANCELLED) return 'danger';
    return 'info';
}