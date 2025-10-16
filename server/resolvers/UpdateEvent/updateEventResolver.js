const { getEventById } = require('../../models/services/EventService');

const updateEventResolver = (_, { id }, { transaction }) => {
  return getEventById({ id, transaction });
};

module.exports = updateEventResolver;
