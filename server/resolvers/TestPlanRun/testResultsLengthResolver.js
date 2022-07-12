const {
    getTesterTestsResultsCount
} = require('../../models/services/TestPlanRunService');

const testResultsLengthResolver = async testPlanRun => {
    return await getTesterTestsResultsCount(testPlanRun.id);
};

module.exports = testResultsLengthResolver;
