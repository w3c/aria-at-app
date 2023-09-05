const { AuthenticationError } = require('apollo-server-core');
const populateData = require('../../services/PopulatedData/populateData');
const saveTestResultCommon = require('./saveTestResultCommon');

const submitTestResultResolver = async (
    { parentContext: { id: testResultId } },
    { input },
    context
) => {
    const { user } = context;

    const { testPlanRun } = await populateData({ testResultId });

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
        isSubmit: true,
        context
    });
};

module.exports = submitTestResultResolver;
