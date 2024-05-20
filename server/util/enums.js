const COLLECTION_JOB_STATUS = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR',
    CANCELLED: 'CANCELLED'
};

const isJobStatusFinal = status =>
    status === COLLECTION_JOB_STATUS.COMPLETED ||
    status === COLLECTION_JOB_STATUS.CANCELLED ||
    status === COLLECTION_JOB_STATUS.ERROR;

module.exports = {
    COLLECTION_JOB_STATUS,
    isJobStatusFinal
};
