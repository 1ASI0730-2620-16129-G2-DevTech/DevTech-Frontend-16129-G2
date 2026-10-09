import { ValidationError } from "../../../shared/domain/model/errors.js";
import { DOCUMENT_LENGTH, DocumentType } from "./document-type.js";

/**
 * Customer registered by the laundry. Identified by a code such as CL001.
 */
export class Customer {
    #id;
    #fullName;
    #phone;
    #documentType;
    #documentNumber;
    #address;

    /**
     * @param {Object} params
     * @param {string} params.id - Customer code, e.g. CL001.
     * @param {string} params.fullName
     * @param {string} params.phone - Nine digits, spaces allowed (987 654 321).
     * @param {string} params.documentType - One of DocumentType.
     * @param {string} params.documentNumber - Digits only; length depends on the document type.
     * @param {string} [params.address]
     */
    constructor({ id, fullName, phone, documentType, documentNumber, address = "" }) {
        if (typeof id !== "string" || !/^CL\d{3,}$/.test(id)) {
            throw new ValidationError("Customer id must follow the CL000 format");
        }
        if (typeof fullName !== "string" || fullName.trim() === "") {
            throw new ValidationError("Customer full name must not be empty");
        }
        if (typeof phone !== "string" || !/^\d{9}$/.test(phone.replace(/\s/g, ""))) {
            throw new ValidationError("Customer phone must have 9 digits");
        }
        if (!Object.values(DocumentType).includes(documentType)) {
            throw new ValidationError(`Customer document type must be one of ${Object.values(DocumentType).join(", ")}`);
        }
        const length = DOCUMENT_LENGTH[documentType];
        if (typeof documentNumber !== "string" || !new RegExp(`^\\d{${length}}$`).test(documentNumber)) {
            throw new ValidationError(`Customer ${documentType} must have ${length} digits`);
        }
        this.#id = id;
        this.#fullName = fullName.trim();
        this.#phone = formatPhone(phone);
        this.#documentType = documentType;
        this.#documentNumber = documentNumber;
        this.#address = String(address).trim();
        Object.freeze(this);
    }

    get id() {
        return this.#id;
    }

    get fullName() {
        return this.#fullName;
    }

    get phone() {
        return this.#phone;
    }

    get documentType() {
        return this.#documentType;
    }

    get documentNumber() {
        return this.#documentNumber;
    }

    get address() {
        return this.#address;
    }
}

/** Groups the nine digits as 987 654 321. */
function formatPhone(phone) {
    return phone.replace(/\s/g, "").replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");
}
