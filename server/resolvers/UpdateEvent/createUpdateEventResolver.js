const {
  createUpdateEvent
} = require('../../models/services/UpdateEventService');

const createUpdateEventResolver = (
  _,
  { description, type = 'GENERAL' },
  { transaction }
) => {
  return createUpdateEvent({
    values: { description, type },
    transaction
  });
};

module.exports = createUpdateEventResolver;
