// server side version of this enum.
// don't forget to also update the client side version in
// server/util/enums.js

export const COLLECTION_JOB_STATUS = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR',
    CANCELLED: 'CANCELLED'
};

export const isJobStatusFinal = status =>
    status === COLLECTION_JOB_STATUS.COMPLETED ||
    status === COLLECTION_JOB_STATUS.CANCELLED ||
    status === COLLECTION_JOB_STATUS.ERROR;
