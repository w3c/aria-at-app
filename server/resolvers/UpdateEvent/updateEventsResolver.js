const { getEvents } = require('../../models/services/EventService');

const updateEventsResolver = async (_, { type }, { transaction }) => {
  const where = type ? { type } : {};
  return getEvents({ where, transaction });
};

module.exports = updateEventsResolver;
