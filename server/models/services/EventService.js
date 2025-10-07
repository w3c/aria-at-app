const ModelService = require('./ModelService');
const { getUserById } = require('./UserService');
const { UpdateEvent } = require('..');
const { EVENT_TYPES, isValidEventType } = require('../../util/eventTypes');
const { EVENT_ATTRIBUTES, USER_ATTRIBUTES } = require('./helpers');
const { convertDateToString } = require('shared/dates');
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
 * @param {object} options
 * @param {object} options.values - values of the UpdateEvent record to be created
 * @param {string} options.values.description - Description of the update event
 * @param {string} options.values.type - Type of the update event (COLLECTION_JOB, GENERAL, TEST_PLAN_RUN, TEST_PLAN_REPORT)
 * @param {string[]} options.eventAttributes - UpdateEvent attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createEvent = async ({
  values: {
    type,
    description,
    performedByUserId = null,
    entityId = null,
    metadata = {}
  },
  eventAttributes = EVENT_ATTRIBUTES,
  transaction
}) => {
  const event = await ModelService.create(UpdateEvent, {
    values: { description, type, performedByUserId, entityId, metadata },
    attributes: eventAttributes,
    transaction
  });

  return {
    ...event.toJSON(),
    timestamp: convertDateToString(event.timestamp, 'DD-MM-YYYY HH:mm')
  };
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to retrieve
 * @param {string[]} options.eventAttributes - UpdateEvent attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getEventById = async ({
  id,
  eventAttributes = EVENT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  const event = await ModelService.getById(UpdateEvent, {
    id,
    attributes: eventAttributes,
    include: [performedByAssociation(userAttributes)],
    transaction
  });

  if (!event) return null;

  return {
    ...event.toJSON(),
    timestamp: convertDateToString(event.timestamp, 'DD-MM-YYYY HH:mm')
  };
};

/**
 * @param {object} options
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.eventAttributes - UpdateEvent attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result
 * @param {number} options.pagination.limit - amount of results to be returned per page
 * @param {string[][]} options.pagination.order - expects a Sequelize structured input dataset for sorting
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getEvents = async ({
  where = {},
  eventAttributes = EVENT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = { order: [['timestamp', 'DESC']] },
  transaction
}) => {
  const events = await ModelService.get(UpdateEvent, {
    where,
    attributes: eventAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });

  return events.map(event => ({
    ...event.toJSON(),
    timestamp: convertDateToString(event.timestamp, 'DD-MM-YYYY HH:mm')
  }));
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to be updated
 * @param {object} options.values - values to be used to update columns for the record
 * @param {string[]} options.eventAttributes - UpdateEvent attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateEventById = async ({
  id,
  values = {},
  eventAttributes = EVENT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(UpdateEvent, {
    where: { id },
    values,
    transaction
  });

  return getEventById({ id, eventAttributes, userAttributes, transaction });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to be deleted
 * @param {boolean} options.truncate - Sequelize specific deletion options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const removeEventById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(UpdateEvent, { id, truncate, transaction });
};

/**
 * Gets events for a specific tester
 * @param {Object} params - The parameters for the query
 * @param {number} params.testerUserId - ID of the tester
 * @param {string[]} [params.eventAttributes] - Event attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.pagination] - Pagination options for query
 * @param {number} [params.pagination.page] - Page to be queried in the pagination result
 * @param {number} [params.pagination.limit] - Amount of results to be returned per page
 * @param {string[][]} [params.pagination.order] - Sequelize structured input dataset for sorting
 * @param {boolean} [params.pagination.enablePagination] - Use to enable pagination for a query result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Array>} Array of events
 */
const getEventsForTester = async ({
  testerUserId,
  eventAttributes = EVENT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(UpdateEvent, {
    where: {
      type: [
        EVENT_TYPES.TESTER_ASSIGNMENT,
        EVENT_TYPES.TESTER_REASSIGNMENT,
        EVENT_TYPES.TESTER_REMOVAL
      ],
      [Op.or]: [
        { metadata: { testerUserId } },
        { metadata: { toTesterUserId: testerUserId } },
        { metadata: { fromTesterUserId: testerUserId } }
      ]
    },
    attributes: eventAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * Gets events for a specific test plan report
 * @param {Object} params - The parameters for the query
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {string[]} [params.eventAttributes] - Event attributes to be returned in the result
 * @param {string[]} [params.userAttributes] - User attributes to be returned in the result
 * @param {Object} [params.pagination] - Pagination options for query
 * @param {number} [params.pagination.page] - Page to be queried in the pagination result
 * @param {number} [params.pagination.limit] - Amount of results to be returned per page
 * @param {string[][]} [params.pagination.order] - Sequelize structured input dataset for sorting
 * @param {boolean} [params.pagination.enablePagination] - Use to enable pagination for a query result
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Array>} Array of events
 */
const getEventsForTestPlanReport = async ({
  testPlanReportId,
  eventAttributes = EVENT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(UpdateEvent, {
    where: { entityId: testPlanReportId },
    attributes: eventAttributes,
    include: [performedByAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * Creates an event for tester assignment
 * @param {Object} params - The parameters for the event
 * @param {number} params.performedByUserId - ID of the user who performed the assignment
 * @param {number} params.testerUserId - ID of the tester being assigned
 * @param {string} params.testerUsername - Username of the tester being assigned
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} params.testPlanRunId - ID of the test plan run
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created event
 */
const createTesterAssignmentEvent = async ({
  performedByUserId,
  testerUserId,
  testerUsername,
  testPlanReportId,
  testPlanRunId,
  transaction = null
}) => {
  return await createEvent({
    values: {
      type: EVENT_TYPES.TESTER_ASSIGNMENT,
      description: `Tester ${testerUsername} assigned to test plan run ${testPlanRunId} in test plan report ${testPlanReportId}`,
      performedByUserId,
      entityId: testPlanReportId,
      metadata: {
        type: EVENT_TYPES.TESTER_ASSIGNMENT,
        testerUserId,
        testPlanReportId,
        testPlanRunId
      }
    },
    transaction
  });
};

/**
 * Creates an event for tester reassignment
 * @param {Object} params - The parameters for the event
 * @param {number} params.performedByUserId - ID of the user who performed the reassignment
 * @param {number} params.fromTesterUserId - ID of the tester being reassigned from
 * @param {string} params.fromTesterUsername - Username of the tester being reassigned from
 * @param {number} params.toTesterUserId - ID of the tester being reassigned to
 * @param {string} params.toTesterUsername - Username of the tester being reassigned to
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} params.testPlanRunId - ID of the test plan run being reassigned
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created event
 */
const createTesterReassignmentEvent = async ({
  performedByUserId,
  fromTesterUserId,
  fromTesterUsername,
  toTesterUserId,
  toTesterUsername,
  testPlanReportId,
  testPlanRunId,
  transaction = null
}) => {
  return await createEvent({
    values: {
      type: EVENT_TYPES.TESTER_REASSIGNMENT,
      description: `Tester reassigned from ${fromTesterUsername} to ${toTesterUsername} for test plan run ${testPlanRunId} in test plan report ${testPlanReportId}`,
      performedByUserId,
      entityId: testPlanReportId,
      metadata: {
        type: EVENT_TYPES.TESTER_REASSIGNMENT,
        fromTesterUserId,
        toTesterUserId,
        testPlanReportId,
        testPlanRunId
      }
    },
    transaction
  });
};

/**
 * Creates an event for tester removal
 * @param {Object} params - The parameters for the event
 * @param {number} params.performedByUserId - ID of the user who performed the removal
 * @param {number} params.testerUserId - ID of the tester being removed
 * @param {string} params.testerUsername - Username of the tester being removed
 * @param {number} params.testPlanReportId - ID of the test plan report
 * @param {number} [params.testPlanRunId] - ID of the test plan run being removed
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created event
 */
const createTesterRemovalEvent = async ({
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
  return await createEvent({
    values: {
      type: EVENT_TYPES.TESTER_REMOVAL,
      description,
      performedByUserId,
      entityId: testPlanReportId,
      metadata: {
        type: EVENT_TYPES.TESTER_REMOVAL,
        testerUserId,
        testPlanReportId,
        testPlanRunId
      }
    },
    transaction
  });
};

/**
 * Example: Using predefined event types
 * @param {Object} params - The parameters for the event
 * @param {number} params.userId - ID of the user logging in
 * @param {Object} params.transaction - Database transaction
 * @returns {Promise<Object>} The created event
 */
const createUserLoginEvent = async ({ userId, transaction }) => {
  return await createEvent({
    values: {
      type: EVENT_TYPES.USER_LOGIN,
      description: `User ${userId} logged in`,
      performedByUserId: userId,
      metadata: {
        type: EVENT_TYPES.USER_LOGIN,
        loginTime: new Date().toISOString()
      }
    },
    transaction
  });
};

/**
 * Example: Validating event types before use
 * @param {Object} params - The parameters for the event
 * @param {string} params.type - The event type to validate and use
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.description - Description of the event
 * @param {Object} params.transaction - Database transaction
 * @returns {Promise<Object>} The created event
 * @throws {Error} If the event type is invalid
 */
const logCustomEvent = async ({ type, userId, description, transaction }) => {
  if (!isValidEventType(type)) {
    throw new Error(`Invalid event type: ${type}`);
  }

  return await createEvent({
    values: {
      type,
      description,
      performedByUserId: userId,
      metadata: {
        type
      }
    },
    transaction
  });
};

/**
 * Simplified event creation helper that fetches required information when necessary and creates events
 * @param {Object} params - The parameters for the event
 * @param {string} params.type - The type of event
 * @param {number} params.performedByUserId - ID of the user who performed the action
 * @param {number} [params.entityId] - Primary entity ID (e.g., testPlanReportId)
 * @param {Object} [params.metadata] - Additional metadata for the event
 * @param {Object} [params.transaction] - Database transaction
 * @returns {Promise<Object>} The created event
 */
const createSimpleEvent = async ({
  type,
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
  switch (type) {
    case EVENT_TYPES.TESTER_ASSIGNMENT:
      description = `Tester ${
        metadata.testerUsername || metadata.testerUserId
      } assigned to test plan run ${
        metadata.testPlanRunId
      } for test plan report ${metadata.testPlanReportId}`;
      break;
    case EVENT_TYPES.TESTER_REASSIGNMENT:
      description = `Tester reassigned from ${
        metadata.fromTesterUsername || metadata.fromTesterUserId
      } to ${
        metadata.toTesterUsername || metadata.toTesterUserId
      } for test plan run ${metadata.testPlanRunId} for test plan report ${
        metadata.testPlanReportId
      }`;
      break;
    case EVENT_TYPES.TESTER_REMOVAL:
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
      description = `${type} event occurred`;
  }

  return await createEvent({
    values: {
      type,
      description,
      performedByUserId,
      entityId,
      metadata
    },
    transaction
  });
};

module.exports = {
  EVENT_ATTRIBUTES,
  createEvent,
  getEventById,
  getEvents,
  updateEventById,
  removeEventById,

  // Custom functions
  getEventsForTester,
  getEventsForTestPlanReport,
  createTesterAssignmentEvent,
  createTesterReassignmentEvent,
  createTesterRemovalEvent,
  createUserLoginEvent,
  logCustomEvent,

  // Simplified event creation helper
  createSimpleEvent
};
