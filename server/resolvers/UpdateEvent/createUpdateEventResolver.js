const { UpdateEvent } = require('../../models');

module.exports = async (
  _,
  { description, type = 'GENERAL', metadata = {} },
  { transaction }
) => {
  const event = await UpdateEvent.create(
    {
      description,
      type,
      metadata
    },
    { transaction }
  );
  const json = event.toJSON();
  return {
    ...json,
    timestamp: event.timestamp.toISOString()
  };
};
