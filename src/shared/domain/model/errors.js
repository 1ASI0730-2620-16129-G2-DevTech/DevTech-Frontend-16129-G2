/**
 * Custom error class for domain-specific validation failures.
 */
export class ValidationError extends Error {
    /**
     * Creates a new ValidationError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Error raised when an aggregate or entity cannot be found.
 */
export class NotFoundError extends Error {
    /**
     * Creates a new NotFoundError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
