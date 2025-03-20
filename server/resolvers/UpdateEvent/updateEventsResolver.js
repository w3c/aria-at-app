const { UpdateEvent } = require('../../models');

module.exports = async (_, { type }, { transaction }) => {
  try {
    const where = type ? { type } : {};
    const events = await UpdateEvent.findAll({
      where,
      order: [['timestamp', 'DESC']],
      transaction
    });

    // Always return an array, never null
    return events.map(event => {
      const json = event.toJSON();
      return {
        ...json,
        // Ensure required fields are never null
        id: json.id || 0,
        timestamp: event.timestamp
          ? event.timestamp.toISOString()
          : new Date().toISOString(),
        description: json.description || '',
        type: json.type || 'GENERAL',
        metadata: json.metadata || {}
      };
    });
  } catch (error) {
    console.error('Error in updateEvents resolver:', error);
    // Return empty array instead of null on error
    return [];
  }
};
