const {
  getUpdateEventById
} = require('../../models/services/UpdateEventService');

module.exports = async (_, { id }, { transaction }) => {
  return await getUpdateEventById({ id, transaction });
};
