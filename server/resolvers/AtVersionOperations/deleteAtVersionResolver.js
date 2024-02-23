const { AuthenticationError } = require('apollo-server');
const { uniq: unique } = require('lodash');
const { removeAtVersionById } = require('../../models/services/AtService');
const {
    getTestResultsUsingAtVersion,
    getTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteAtVersionResolver = async (
    { parentContext: { id: atVersionId } },
    _,
    context
) => {
    const { user, t } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const resultIds = await getTestResultsUsingAtVersion(atVersionId, { t });

    if (!resultIds.length) {
        await removeAtVersionById({ id: atVersionId, t });
        return { isDeleted: true };
    }

    const populatedTestResults = populateTestResults(resultIds, context);

    return {
        isDeleted: false,
        failedDueToTestResults: populatedTestResults
    };
};

const populateTestResults = async (resultIds, context) => {
    const { t } = context;

    // Limits the number of queries that will be made for this endpoint
    const queryLimit = 10;

    const testPlanRunIds = unique(
        resultIds.map(({ testPlanRunId }) => testPlanRunId)
    ).slice(0, queryLimit);

    const preloadedTestPlanRunsById = {};
    await Promise.all(
        testPlanRunIds.map(async testPlanRunId => {
            const data = await getTestPlanRunById({ id: testPlanRunId, t });
            preloadedTestPlanRunsById[testPlanRunId] = data;
        })
    );

    return Promise.all(
        resultIds.map(({ testResultId, testPlanRunId }) => {
            const testPlanRun = preloadedTestPlanRunsById[testPlanRunId];
            return populateData(
                { testResultId },
                { preloaded: { testPlanRun } }
            );
        })
    );
};

module.exports = deleteAtVersionResolver;
