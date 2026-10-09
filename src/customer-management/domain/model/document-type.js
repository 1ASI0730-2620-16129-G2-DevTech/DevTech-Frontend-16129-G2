/**
 * Identity documents accepted for a customer, with the digit count each one requires.
 */
export const DocumentType = Object.freeze({
    DNI: "DNI",
    CE: "CE",
});

export const DOCUMENT_LENGTH = Object.freeze({
    [DocumentType.DNI]: 8,
    [DocumentType.CE]: 9,
});
