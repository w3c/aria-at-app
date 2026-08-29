const { AuthenticationError } = require('apollo-server-express');
const { getEventById } = require('../../models/services/EventService');

const updateEventResolver = (_, { id }, { user, transaction }) => {
  if (!user) {
    throw new AuthenticationError();
  }
  return getEventById({ id, transaction });
};

module.exports = updateEventResolver;
