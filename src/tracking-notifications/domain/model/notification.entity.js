/**
 * Types of notification the system can send. Each type has its texts under
 * `notifications.types.<type>` in the locale files.
 */
export const NotificationType = Object.freeze({
    ORDER_STAGE_CHANGED: 'order-stage-changed',
    ORDER_ON_THE_WAY: 'order-on-the-way',
    PICKUP_ON_THE_WAY: 'pickup-on-the-way'
});

/**
 * Notification entity of the Tracking & Notifications bounded context.
 * A message addressed to a user about a relevant event (e.g. an order stage change).
 * The text is not stored: it is built from the type and its parameters so it can be translated.
 */
export class Notification {
    /**
     * @param {Object} props
     * @param {number|null} props.id - Notification identifier.
     * @param {string|null} props.userId - Customer code (e.g. CL001) of the user who receives it.
     * @param {string} props.type - One of the NotificationType values.
     * @param {Object} props.parameters - Values used to build the message (e.g. orderId, stage).
     * @param {boolean} props.isRead - Whether the user has already been shown it.
     * @param {string} props.createdAt - Creation date (ISO string).
     */
    constructor({ id = null, userId = null, type = '', parameters = {}, isRead = false, createdAt = '' }) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.parameters = parameters ?? {};
        this.isRead = isRead;
        this.createdAt = createdAt;
    }
}