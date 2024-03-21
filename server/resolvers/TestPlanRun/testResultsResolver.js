const {
    getTestResults
} = require('../../models/services/TestResultReadService');

const testResultsResolver = async (testPlanRun, _, context) => {
    return getTestResults({ testPlanRun, context });
};

module.exports = testResultsResolver;
