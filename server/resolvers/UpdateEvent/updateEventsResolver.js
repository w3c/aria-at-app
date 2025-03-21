const { getUpdateEvents } = require('../../models/services/UpdateEventService');

const updateEventsResolver = async (_, { type }, { transaction }) => {
  const where = type ? { type } : {};
  return getUpdateEvents({ where, transaction });
};

module.exports = updateEventsResolver;
