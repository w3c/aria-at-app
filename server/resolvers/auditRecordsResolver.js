const { AuthenticationError } = require('apollo-server');
const { getAuditRecords } = require('../models/services/AuditService');

const auditRecordsResolver = async (_, { eventType }, context) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  const where = {};
  if (eventType) {
    where.eventType = eventType;
  }

  return getAuditRecords({
    where,
    pagination: {
      order: [['createdAt', 'DESC']]
    },
    transaction
  });
};

module.exports = auditRecordsResolver;
