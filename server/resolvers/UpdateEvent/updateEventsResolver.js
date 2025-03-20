const { getUpdateEvents } = require('../../models/services/UpdateEventService');

module.exports = async (_, { type }, { transaction }) => {
  try {
    const where = type ? { type } : {};
    return await getUpdateEvents({ where, transaction });
  } catch (error) {
    console.error('Error in updateEvents resolver:', error);
    return [];
  }
};
