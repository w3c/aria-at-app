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

/**
 * Enum for possible workflow services
 * @readonly
 * @enum {string}
 */
const AUTOMATION_SERVICE = Object.freeze({
  GITHUB_ACTIONS: 'GITHUB_ACTIONS',
  AZURE_PIPELINES: 'AZURE_PIPELINES'
});

module.exports = {
  COLLECTION_JOB_STATUS,
  isJobStatusFinal,
  AUTOMATION_SERVICE
};
