const { AuthenticationError } = require('apollo-server');
const {
  getAuditRecordsForTester
} = require('../../models/services/AuditService');

const auditRecordsForTesterResolver = async (
  { parentContext: { id: testerUserId } },
  _,
  context
) => {
  const { user, transaction } = context;

  if (
    !(
      user?.roles.find(role => role.name === 'ADMIN') ||
      (user?.roles.find(role => role.name === 'TESTER') &&
        testerUserId == user.id)
    )
  ) {
    throw new AuthenticationError();
  }

  return getAuditRecordsForTester({
    testerUserId,
    pagination: {
      order: [['createdAt', 'DESC']]
    },
    transaction
  });
};

module.exports = auditRecordsForTesterResolver;
