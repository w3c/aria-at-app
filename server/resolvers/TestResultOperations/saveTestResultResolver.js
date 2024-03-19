const { AuthenticationError } = require('apollo-server-core');
const populateData = require('../../services/PopulatedData/populateData');
const saveTestResultCommon = require('./saveTestResultCommon');

const saveTestResultResolver = async (
  { parentContext: { id: testResultId } },
  { input },
  context
) => {
  const { user, transaction } = context;

  const { testPlanRun } = await populateData({ testResultId }, { transaction });

  if (
    !(
      user?.roles.find(role => role.name === 'ADMIN') ||
      (user?.roles.find(role => role.name === 'TESTER') &&
        testPlanRun.testerUserId == user.id)
    )
  ) {
    throw new AuthenticationError();
  }

  return saveTestResultCommon({
    testResultId,
    input,
    user,
    isSubmit: false,
    context
  });
};

module.exports = saveTestResultResolver;
