const DataLoader = require('dataloader');
const { getUsers } = require('../../models/services/UserService');

const createUserAtsBatchLoader = context => {
  return new DataLoader(async userIds => {
    const users = await getUsers({
      where: { id: userIds },
      roleAttributes: [],
      testPlanRunAttributes: [],
      vendorAttributes: [],
      transaction: context.transaction
    });

    const atsById = {};
    users.forEach(user => {
      atsById[user.id] = user.ats || [];
    });

    return userIds.map(userId => atsById[userId] || []);
  });
};

const atsResolver = async (user, __, context) => {
  if (!context.loaders) {
    context.loaders = {};
  }

  if (!context.loaders.userAts) {
    context.loaders.userAts = createUserAtsBatchLoader(context);
  }

  return context.loaders.userAts.load(user.id);
};

module.exports = atsResolver;
