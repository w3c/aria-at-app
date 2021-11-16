const runnableTests = require('./runnableTestsResolver');
const draftTestPlanRuns = require('./draftTestPlanRunsResolver');
const finalizedTestResults = require('./finalizedTestResultsResolver');
const conflicts = require('./conflictsResolver');
const conflictsFormatted = require('./conflictsFormattedResolver');

module.exports = {
    runnableTests,
    draftTestPlanRuns,
    finalizedTestResults,
    conflicts,
    conflictsFormatted
};
