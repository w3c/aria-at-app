const { getEvents } = require('../../models/services/EventService');

const updateEventsResolver = async (_, { types }, { transaction }) => {
  const where = types ? { type: types } : {};
  return getEvents({ where, transaction });
};

module.exports = updateEventsResolver;
