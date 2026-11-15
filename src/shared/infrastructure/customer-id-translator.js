/**
 * Anti-corruption layer for customer identifiers.
 *
 * The web app identifies customers with codes such as "CL005" (Customer Management, still on the mock API),
 * while the backend references them by id only: Order Management uses a GUID and
 * Subscription & Payment uses an integer. This translator maps one code to the same backend ids every time,
 * so an order and its payment keep pointing to the same customer:
 *   "CL005"  <->  5  <->  "00000000-0000-0000-0000-000000000005"
 */

const CUSTOMER_CODE = /^CL(\d+)$/;
const CUSTOMER_GUID = /^0{8}-0{4}-0{4}-0{4}-(\d{12})$/i;
const GUID_PREFIX = "00000000-0000-0000-0000-";

/**
 * @param {string} code - e.g. "CL005".
 * @returns {number} e.g. 5.
 */
export function customerCodeToNumber(code) {
    const match = CUSTOMER_CODE.exec(String(code));
    if (!match) throw new Error(`Invalid customer code: ${code}`);
    return Number(match[1]);
}

/**
 * @param {number} number - e.g. 5.
 * @returns {string} e.g. "CL005".
 */
export function customerNumberToCode(number) {
    return `CL${String(number).padStart(3, "0")}`;
}

/**
 * @param {string} code - e.g. "CL005".
 * @returns {string} e.g. "00000000-0000-0000-0000-000000000005".
 */
export function customerCodeToGuid(code) {
    return GUID_PREFIX + String(customerCodeToNumber(code)).padStart(12, "0");
}

/**
 * GUIDs created by this translator go back to their code; any other GUID
 * (for example orders registered straight in the backend) is kept as it is.
 * @param {string} guid
 * @returns {string}
 */
export function customerGuidToCode(guid) {
    const match = CUSTOMER_GUID.exec(String(guid));
    return match ? customerNumberToCode(Number(match[1])) : guid;
}
