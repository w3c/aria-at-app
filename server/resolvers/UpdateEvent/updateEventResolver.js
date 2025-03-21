const {
  getUpdateEventById
} = require('../../models/services/UpdateEventService');

const updateEventResolver = (_, { id }, { transaction }) => {
  return getUpdateEventById({ id, transaction });
};

module.exports = updateEventResolver;
