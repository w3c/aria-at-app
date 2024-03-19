const { AuthenticationError } = require('apollo-server-core');
const populateData = require('../../services/PopulatedData/populateData');
const saveTestResultCommon = require('./saveTestResultCommon');

const submitTestResultResolver = async (
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

  let testResultInput = { ...input };
  if (
    !testResultInput.atVersionId ||
    !testResultInput.browserVersionId ||
    !testResultInput.scenarioResults
  ) {
    const { testResult } = await populateData(
      { testResultId },
      { transaction }
    );

    if (!testResult) {
      throw new Error(
        'Cannot submit a test result that does not exist unless results are included in the request'
      );
    }

    testResultInput = {
      atVersionId: testResult.atVersionId,
      browserVersionId: testResult.browserVersionId,
      scenarioResults: testResult.scenarioResults
    };
  }

  return saveTestResultCommon({
    testResultId,
    input: testResultInput,
    user,
    isSubmit: true,
    context
  });
};

module.exports = submitTestResultResolver;
