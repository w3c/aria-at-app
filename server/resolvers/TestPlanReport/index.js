const runnableTests = require('./runnableTestsResolver');
const draftTestPlanRuns = require('./draftTestPlanRunsResolver');
const finalizedTestResults = require('./finalizedTestResultsResolver');
const conflicts = require('./conflictsResolver');

module.exports = {
    runnableTests,
    draftTestPlanRuns,
    finalizedTestResults,
    conflicts
};
