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
