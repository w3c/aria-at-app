const ModelService = require('./ModelService');
const { UpdateEvent } = require('../');

const UPDATE_EVENT_ATTRIBUTES = [
  'id',
  'timestamp',
  'description',
  'type',
  'metadata'
];

/**
 * @param {object} options
 * @param {object} options.values - values of the UpdateEvent record to be created
 * @param {string} options.values.description - Description of the update event
 * @param {string} options.values.type - Type of the update event
 * @param {object} options.values.metadata - Additional metadata for the update event
 * @param {string[]} options.updateEventAttributes - UpdateEvent attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createUpdateEvent = async ({
  values: { description, type, metadata },
  updateEventAttributes = UPDATE_EVENT_ATTRIBUTES,
  transaction
}) => {
  return ModelService.create(UpdateEvent, {
    values: { description, type, metadata },
    attributes: updateEventAttributes,
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to retrieve
 * @param {string[]} options.updateEventAttributes - UpdateEvent attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUpdateEventById = async ({
  id,
  updateEventAttributes = UPDATE_EVENT_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(UpdateEvent, {
    id,
    attributes: updateEventAttributes,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.updateEventAttributes - UpdateEvent attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result
 * @param {number} options.pagination.limit - amount of results to be returned per page
 * @param {string[][]} options.pagination.order - expects a Sequelize structured input dataset for sorting
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUpdateEvents = async ({
  where = {},
  updateEventAttributes = UPDATE_EVENT_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(UpdateEvent, {
    where,
    attributes: updateEventAttributes,
    pagination,
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to be updated
 * @param {object} options.values - values to be used to update columns for the record
 * @param {string[]} options.updateEventAttributes - UpdateEvent attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateUpdateEventById = async ({
  id,
  values = {},
  updateEventAttributes = UPDATE_EVENT_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(UpdateEvent, {
    where: { id },
    values,
    transaction
  });

  return ModelService.getById(UpdateEvent, {
    id,
    attributes: updateEventAttributes,
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the UpdateEvent to be deleted
 * @param {boolean} options.truncate - Sequelize specific deletion options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const removeUpdateEventById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(UpdateEvent, {
    id,
    truncate,
    transaction
  });
};

module.exports = {
  UPDATE_EVENT_ATTRIBUTES,
  createUpdateEvent,
  getUpdateEventById,
  getUpdateEvents,
  updateUpdateEventById,
  removeUpdateEventById
};
