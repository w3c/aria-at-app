const { AuthenticationError } = require('apollo-server-errors');
const {
  getTestPlanVersionById,
  updateTestPlanVersionById
} = require('../models/services/TestPlanVersionService');
const checkUserRole = require('./helpers/checkUserRole');

const addViewerResolver = async (_, { testPlanVersionId, testId }, context) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  const testPlanVersion = await getTestPlanVersionById({
    id: testPlanVersionId,
    transaction
  });
  const currentTest = testPlanVersion.tests.find(each => each.id === testId);
  if (!currentTest.viewers) currentTest.viewers = [user];
  else {
    const viewer = currentTest.viewers.find(each => each.id === user.id);
    if (!viewer) currentTest.viewers.push(user);
  }

  await updateTestPlanVersionById({
    id: testPlanVersionId,
    values: { tests: testPlanVersion.tests },
    transaction
  });

  return user;
};

module.exports = addViewerResolver;
