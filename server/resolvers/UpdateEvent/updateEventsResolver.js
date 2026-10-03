const { AuthenticationError } = require('apollo-server-express');
const { getEvents } = require('../../models/services/EventService');

const updateEventsResolver = async (_, { types }, { user, transaction }) => {
  if (!user) {
    throw new AuthenticationError();
  }
  const where = types ? { type: types } : {};
  return getEvents({ where, transaction });
};

module.exports = updateEventsResolver;
