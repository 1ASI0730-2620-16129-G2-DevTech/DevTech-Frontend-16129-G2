/**
 * Short code that people use to recognise an order. Every board shows it the same way.
 * It takes the END of the id: new ids are UUID v7, which start with the creation time,
 * so orders created close together share their first characters.
 * Numeric ids of older mock records (1, 2, ...) are padded instead.
 * @param {string|number|null} orderId
 * @returns {string} For example "#5E0B3C" or "#0007".
 */
export function toOrderCode(orderId) {
    const id = String(orderId ?? "");
    if (!id) return "—";
    return /^\d+$/.test(id) ? `#${id.padStart(4, "0")}` : `#${id.slice(-6).toUpperCase()}`;
}
