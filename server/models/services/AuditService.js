const ModelService = require('./ModelService');
const { Audit } = require('../index');
const {
  AUDIT_EVENT_TYPES,
  isValidEventType
} = require('../../util/auditEventTypes');
const { AUDIT_ATTRIBUTES, USER_ATTRIBUTES } = require('./helpers');
const { getUserById } = require('./UserService');
const { Op } = require('sequelize');

// Association helpers to be included with Models' results
/**
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const performedByAssociation = userAttributes => ({
  association: 'performedBy',
  attributes: userAttributes
});

/**
 * Gets audit records with filtering and pagination
 * @param {Object} params - The parameters for the query
 * @param {Object} [params.where] - Where conditions for filtering
 * @param {string[]} [params.auditAttributes] - Audit attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.pagination] - Pagination options for query
 * @param {number} [params.pagination.page] - Page to be queried in the pagination result
 * @param {number} [params.pagination.limit] - Amount of results to be returned per page
 * @param {string[][]} [params.pagination.order] - Sequelize structured input dataset for sorting
 * @param {boolean} [params.pagination.enablePagination] - Use to enable pagination for a query result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Array>} Array of audit records
 */
const getAuditRecords = async ({
  where = {},
  auditAttributes = AUDIT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(Audit, {
    where,
    attributes: auditAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * Gets audit records by ID
 * @param {Object} params - The parameters for the query
 * @param {number} params.id - ID of the audit record
 * @param {string[]} [params.auditAttributes] - Audit attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} Audit record
 */
const getAuditRecordById = async ({
  id,
  auditAttributes = AUDIT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(Audit, {
    id,
    attributes: auditAttributes,
    include: [performedByAssociation(userAttributes)],
    transaction
  });
};

/**
 * Gets audit records for a specific tester
 * @param {Object} params - The parameters for the query
 * @param {number} params.testerUserId - ID of the tester
 * @param {string[]} [params.auditAttributes] - Audit attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.pagination] - Pagination options for query
 * @param {number} [params.pagination.page] - Page to be queried in the pagination result
 * @param {number} [params.pagination.limit] - Amount of results to be returned per page
 * @param {string[][]} [params.pagination.order] - Sequelize structured input dataset for sorting
 * @param {boolean} [params.pagination.enablePagination] - Use to enable pagination for a query result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Array>} Array of audit records
 */
const getAuditRecordsForTester = async ({
  testerUserId,
  auditAttributes = AUDIT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(Audit, {
    where: {
      eventType: [
        AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT,
        AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT,
        AUDIT_EVENT_TYPES.TESTER_REMOVAL
      ],
      [Op.or]: [
        { metadata: { testerUserId } },
        { metadata: { toTesterUserId: testerUserId } },
        { metadata: { fromTesterUserId: testerUserId } }
      ]
    },
    attributes: auditAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * Gets audit records for a specific test plan report
 * @param {Object} params - The parameters for the query
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {string[]} [params.auditAttributes] - Audit attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.pagination] - Pagination options for query
 * @param {number} [params.pagination.page] - Page to be queried in the pagination result
 * @param {number} [params.pagination.limit] - Amount of results to be returned per page
 * @param {string[][]} [params.pagination.order] - Sequelize structured input dataset for sorting
 * @param {boolean} [params.pagination.enablePagination] - Use to enable pagination for a query result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Array>} Array of audit records
 */
const getAuditRecordsForTestPlanReport = async ({
  testPlanReportId,
  auditAttributes = AUDIT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(Audit, {
    where: { entityId: testPlanReportId },
    attributes: auditAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * Creates an audit record for a tester assignment event
 * @param {Object} params - The parameters for the audit record
 * @param {string} params.eventType - The type of event (TESTER_ASSIGNMENT, TESTER_REASSIGNMENT, etc.)
 * @param {string} params.description - Human-readable description of the event
 * @param {number} params.performedByUserId - ID of the user who performed the action
 * @param {number} [params.entityId] - Primary entity ID (e.g., testPlanReportId)
 * @param {Object} [params.metadata] - Additional metadata for the event
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created audit record
 */
const createAuditRecord = async ({
  eventType,
  description,
  performedByUserId,
  entityId = null,
  metadata = {},
  transaction
}) => {
  return ModelService.create(Audit, {
    values: {
      eventType,
      description,
      performedByUserId,
      entityId,
      metadata
    },
    transaction
  });
};

/**
 * Updates an audit record by ID
 * @param {Object} params - The parameters for the update
 * @param {number} params.id - ID of the audit record to update
 * @param {Object} params.values - Values to update
 * @param {string[]} [params.auditAttributes] - Audit attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} Updated audit record
 */
const updateAuditRecordById = async ({
  id,
  values,
  auditAttributes = AUDIT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(Audit, {
    where: { id },
    values,
    transaction
  });

  return getAuditRecordById({
    id,
    auditAttributes,
    userAttributes,
    transaction
  });
};

/**
 * Removes an audit record by ID
 * @param {Object} params - The parameters for the removal
 * @param {number} params.id - ID of the audit record to remove
 * @param {boolean} [params.truncate] - Sequelize specific deletion options
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<boolean>} True if record was deleted
 */
const removeAuditRecordById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(Audit, {
    id,
    truncate,
    transaction
  });
};

/**
 * Creates an audit record for tester assignment
 * @param {Object} params - The parameters for the audit record
 * @param {number} params.performedByUserId - ID of the user who performed the assignment
 * @param {number} params.testerUserId - ID of the tester being assigned
 * @param {string} params.testerUsername - Username of the tester being assigned
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} params.testPlanRunId - ID of the test plan run
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created audit record
 */
const auditTesterAssignment = async ({
  performedByUserId,
  testerUserId,
  testerUsername,
  testPlanReportId,
  testPlanRunId,
  transaction = null
}) => {
  return await createAuditRecord({
    eventType: AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT,
    description: `Tester ${testerUsername} assigned to test plan run ${testPlanRunId} in test plan report ${testPlanReportId}`,
    performedByUserId,
    entityId: testPlanReportId,
    metadata: {
      eventType: AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT,
      testerUserId,
      testPlanReportId,
      testPlanRunId
    },
    transaction
  });
};

/**
 * Creates an audit record for tester reassignment
 * @param {Object} params - The parameters for the audit record
 * @param {number} params.performedByUserId - ID of the user who performed the reassignment
 * @param {number} params.fromTesterUserId - ID of the tester being reassigned from
 * @param {string} params.fromTesterUsername - Username of the tester being reassigned from
 * @param {number} params.toTesterUserId - ID of the tester being reassigned to
 * @param {string} params.toTesterUsername - Username of the tester being reassigned to
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} params.testPlanRunId - ID of the test plan run being reassigned
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created audit record
 */
const auditTesterReassignment = async ({
  performedByUserId,
  fromTesterUserId,
  fromTesterUsername,
  toTesterUserId,
  toTesterUsername,
  testPlanReportId,
  testPlanRunId,
  transaction = null
}) => {
  return await createAuditRecord({
    eventType: AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT,
    description: `Tester reassigned from ${fromTesterUsername} to ${toTesterUsername} for test plan run ${testPlanRunId} in test plan report ${testPlanReportId}`,
    performedByUserId,
    entityId: testPlanReportId,
    metadata: {
      eventType: AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT,
      fromTesterUserId,
      toTesterUserId,
      testPlanReportId,
      testPlanRunId
    },
    transaction
  });
};

/**
 * Creates an audit record for tester removal
 * @param {Object} params - The parameters for the audit record
 * @param {number} params.performedByUserId - ID of the user who performed the removal
 * @param {number} params.testerUserId - ID of the tester being removed
 * @param {string} params.testerUsername - Username of the tester being removed
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} [params.testPlanRunId] - ID of the test plan run being removed
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created audit record
 */
const auditTesterRemoval = async ({
  performedByUserId,
  testerUserId,
  testerUsername,
  testPlanReportId,
  testPlanRunId = null,
  transaction = null
}) => {
  const description = testPlanRunId
    ? `Tester ${testerUsername} removed from test plan run ${testPlanRunId} in test plan report ${testPlanReportId}`
    : `Tester ${testerUsername} removed from test plan report ${testPlanReportId}`;
  return await createAuditRecord({
    eventType: AUDIT_EVENT_TYPES.TESTER_REMOVAL,
    description,
    performedByUserId,
    entityId: testPlanReportId,
    metadata: {
      eventType: AUDIT_EVENT_TYPES.TESTER_REMOVAL,
      testerUserId,
      testPlanReportId,
      testPlanRunId
    },
    transaction
  });
};

/**
 * Simplified audit creation helper that fetches required information when necessary and creates audit records
 * @param {Object} params - The parameters for the audit record
 * @param {string} params.eventType - The type of event
 * @param {number} params.performedByUserId - ID of the user who performed the action
 * @param {number} [params.entityId] - Primary entity ID (e.g., testPlanReportId)
 * @param {Object} [params.metadata] - Additional metadata for the event
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created audit record
 */
const createSimpleAuditRecord = async ({
  eventType,
  performedByUserId,
  entityId = null,
  metadata = {},
  transaction
}) => {
  // Fetch usernames for tester-related
  if (transaction) {
    const updatedMetadata = { ...metadata };

    // Fetch username for performedByUserId
    if (performedByUserId) {
      try {
        const { username: performedByUsername } = await getUserById({
          id: performedByUserId,
          transaction
        });
        updatedMetadata.performedByUsername = performedByUsername;
      } catch (error) {
        // Silently continue if user not found
      }
    }

    // Fetch usernames for tester-related metadata
    if (metadata.testerUserId) {
      try {
        const { username: testerUsername } = await getUserById({
          id: metadata.testerUserId,
          transaction
        });
        updatedMetadata.testerUsername = testerUsername;
      } catch (error) {
        // Silently continue if user not found
      }
    }

    if (metadata.fromTesterUserId) {
      try {
        const { username: fromTesterUsername } = await getUserById({
          id: metadata.fromTesterUserId,
          transaction
        });
        updatedMetadata.fromTesterUsername = fromTesterUsername;
      } catch (error) {
        // Silently continue if user not found
      }
    }

    if (metadata.toTesterUserId) {
      try {
        const { username: toTesterUsername } = await getUserById({
          id: metadata.toTesterUserId,
          transaction
        });
        updatedMetadata.toTesterUsername = toTesterUsername;
      } catch (error) {
        // Silently continue if user not found
      }
    }
    metadata = updatedMetadata;
  }

  // Generate description based on event type and metadata
  let description = '';
  switch (eventType) {
    case AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT:
      description = `Tester ${
        metadata.testerUsername || metadata.testerUserId
      } assigned to test plan run ${
        metadata.testPlanRunId
      } for test plan report ${metadata.testPlanReportId}`;
      break;
    case AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT:
      description = `Tester reassigned from ${
        metadata.fromTesterUsername || metadata.fromTesterUserId
      } to ${
        metadata.toTesterUsername || metadata.toTesterUserId
      } for test plan run ${metadata.testPlanRunId} for test plan report ${
        metadata.testPlanReportId
      }`;
      break;
    case AUDIT_EVENT_TYPES.TESTER_REMOVAL:
      description = metadata.testPlanRunId
        ? `Tester ${
            metadata.testerUsername || metadata.testerUserId
          } removed from test plan run ${
            metadata.testPlanRunId
          } for test plan report ${metadata.testPlanReportId}`
        : `Tester ${
            metadata.testerUsername || metadata.testerUserId
          } removed from test plan report ${metadata.testPlanReportId}`;
      break;
    default:
      description = `${eventType} event occurred`;
  }

  return await createAuditRecord({
    eventType,
    description,
    performedByUserId,
    entityId,
    metadata,
    transaction
  });
};

/**
 * Example: Using predefined event types
 * @param {number} userId - ID of the user logging in
 * @returns {Promise<Object>} The created audit record
 */
const logUserLogin = async userId => {
  return await createAuditRecord({
    eventType: AUDIT_EVENT_TYPES.USER_LOGIN,
    description: `User ${userId} logged in`,
    performedByUserId: userId,
    metadata: {
      eventType: AUDIT_EVENT_TYPES.USER_LOGIN,
      loginTime: new Date().toISOString()
    }
  });
};

/**
 * Example: Validating event types before use
 * @param {string} eventType - The event type to validate and use
 * @param {number} userId - ID of the user performing the action
 * @param {string} description - Description of the event
 * @returns {Promise<Object>} The created audit record
 * @throws {Error} If the event type is invalid
 */
const logCustomEvent = async (eventType, userId, description) => {
  if (!isValidEventType(eventType)) {
    throw new Error(`Invalid event type: ${eventType}`);
  }

  return await createAuditRecord({
    eventType,
    description,
    performedByUserId: userId,
    metadata: {
      eventType
    }
  });
};

module.exports = {
  getAuditRecords,
  getAuditRecordById,
  getAuditRecordsForTester,
  getAuditRecordsForTestPlanReport,
  createAuditRecord,
  updateAuditRecordById,
  removeAuditRecordById,

  // Simplified audit helper
  createSimpleAuditRecord,

  // Custom events
  auditTesterAssignment,
  auditTesterReassignment,
  auditTesterRemoval,
  logUserLogin,
  logCustomEvent
};
