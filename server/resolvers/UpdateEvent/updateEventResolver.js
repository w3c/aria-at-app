const { UpdateEvent } = require('../../models');

module.exports = async (_, { id }, { transaction }) => {
  const event = await UpdateEvent.findByPk(id, { transaction });
  if (!event) return null;
  const json = event.toJSON();
  return {
    ...json,
    timestamp: event.timestamp.toISOString()
  };
};
