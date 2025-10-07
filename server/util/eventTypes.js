/**
 * This file centralizes all event types used throughout.
 * Add new event types here to make them available everywhere.
 */

const EVENT_TYPES = {
  GENERAL: 'GENERAL',

  // Tester-related events
  TESTER_ASSIGNMENT: 'TESTER_ASSIGNMENT',
  TESTER_REASSIGNMENT: 'TESTER_REASSIGNMENT',
  TESTER_REMOVAL: 'TESTER_REMOVAL',

  // Test plan report events
  TEST_PLAN_REPORT_CREATION: 'TEST_PLAN_REPORT_CREATION',
  TEST_PLAN_REPORT_UPDATE: 'TEST_PLAN_REPORT_UPDATE',
  TEST_PLAN_REPORT_FINALIZATION: 'TEST_PLAN_REPORT_FINALIZATION',

  // Test plan run events
  TEST_PLAN_RUN_CREATION: 'TEST_PLAN_RUN_CREATION',
  TEST_PLAN_RUN_UPDATE: 'TEST_PLAN_RUN_UPDATE',
  TEST_PLAN_RUN_DELETION: 'TEST_PLAN_RUN_DELETION',

  // Test result events
  TEST_RESULT_SUBMISSION: 'TEST_RESULT_SUBMISSION',
  TEST_RESULT_UPDATE: 'TEST_RESULT_UPDATE',
  TEST_RESULT_DELETION: 'TEST_RESULT_DELETION',

  // Collection job events
  COLLECTION_JOB_CREATION: 'COLLECTION_JOB_CREATION',
  COLLECTION_JOB_START: 'COLLECTION_JOB_START',
  COLLECTION_JOB_COMPLETION: 'COLLECTION_JOB_COMPLETION',
  COLLECTION_JOB_FAILURE: 'COLLECTION_JOB_FAILURE',
  COLLECTION_TEST_PLAN_REPORT: 'COLLECTION_TEST_PLAN_REPORT',

  // User and permission events
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT'
};

/**
 * Get all available audit event types as an array
 * @returns {string[]} Array of all event type strings
 */
const getAllEventTypes = () => Object.values(EVENT_TYPES);

/**
 * Check if an event type is valid
 * @param {string} eventType - The event type to validate
 * @returns {boolean} True if the event type is valid
 */
const isValidEventType = eventType =>
  Object.values(EVENT_TYPES).includes(eventType);

/**
 * Get event types by category
 * @param {string} category - The category to filter by (e.g., 'TESTER', 'TEST_PLAN_REPORT')
 * @returns {string[]} Array of event types matching the category
 */
const getEventTypesByCategory = category => {
  return Object.values(EVENT_TYPES).filter(eventType =>
    eventType.startsWith(category)
  );
};

/**
 * Get tester-related event types
 * @returns {string[]} Array of tester event types
 */
const getTesterEventTypes = () => getEventTypesByCategory('TESTER');

/**
 * Get test plan report-related event types
 * @returns {string[]} Array of test plan report event types
 */
const getTestPlanReportEventTypes = () =>
  getEventTypesByCategory('TEST_PLAN_REPORT');

/**
 * Get test plan run-related event types
 * @returns {string[]} Array of test plan run event types
 */
const getTestPlanRunEventTypes = () => getEventTypesByCategory('TEST_PLAN_RUN');

/**
 * Get test result-related event types
 * @returns {string[]} Array of test result event types
 */
const getTestResultEventTypes = () => getEventTypesByCategory('TEST_RESULT');

/**
 * Get automation collection-related event types
 * @returns {string[]} Array of automation collection event types
 */
const getCollectionEventTypes = () => getEventTypesByCategory('COLLECTION');

/**
 * Get user-related event types
 * @returns {string[]} Array of user event types
 */
const getUserEventTypes = () => getEventTypesByCategory('USER');

module.exports = {
  EVENT_TYPES,
  getAllEventTypes,
  isValidEventType,
  getEventTypesByCategory,
  getTesterEventTypes,
  getTestPlanReportEventTypes,
  getTestPlanRunEventTypes,
  getTestResultEventTypes,
  getCollectionEventTypes,
  getUserEventTypes
};
