import { v7 as uuidv7 } from 'uuid';

/**
 * Any 128-bit identifier written as 8-4-4-4-12 hexadecimal digits.
 * The backend (.NET Guid) accepts ids that are not RFC 4122 UUIDs (e.g. 11111111-1111-1111-1111-111111111111),
 * so the web app accepts them as well.
 */
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Generates a new UUID v7.
 * @returns {string} A UUID string.
 */
export function generateUuid() {
    return uuidv7();
}

/**
 * Validates if a string is a valid UUID.
 * @param {string} value - The string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateUuid(value) {
    return typeof value === "string" && GUID_PATTERN.test(value);
}