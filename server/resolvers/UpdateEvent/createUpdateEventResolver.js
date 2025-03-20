const {
  createUpdateEvent
} = require('../../models/services/UpdateEventService');

module.exports = async (
  _,
  { description, type = 'GENERAL' },
  { transaction }
) => {
  return await createUpdateEvent({
    values: { description, type },
    transaction
  });
};
