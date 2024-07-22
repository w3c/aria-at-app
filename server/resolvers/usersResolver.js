const { getUsers } = require('../models/services/UserService');

const usersResolver = (_, __, context) => {
  const { transaction } = context;

  // No authentication since participation is public!
  return getUsers({
    userAttributes: null,
    roleAttributes: null,
    atAttributes: null,
    testPlanRunAttributes: null,
    pagination: { order: [['username', 'ASC']] },
    transaction
  });
};

module.exports = usersResolver;
