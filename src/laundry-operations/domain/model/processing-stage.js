/**
 * Enumeration of the stages a laundry order goes through, in processing order.
 */
export const ProcessingStage = Object.freeze({
    RECEPTION: 'RECEPTION',
    CLASSIFICATION: 'CLASSIFICATION',
    WASHING: 'WASHING',
    DRYING_IRONING: 'DRYING_IRONING',
    PACKAGING: 'PACKAGING',
    READY: 'READY'
});

/** Stages in processing order. */
export const PROCESSING_STAGES = Object.freeze(Object.values(ProcessingStage));

/**
 * Returns the stage that follows the given one.
 * @param {string} stage - A value of {@link ProcessingStage}.
 * @returns {string|null} The next stage, or null if the stage is the last one.
 */
export function nextStage(stage) {
    return PROCESSING_STAGES[PROCESSING_STAGES.indexOf(stage) + 1] ?? null;
}
