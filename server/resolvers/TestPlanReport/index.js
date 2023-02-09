const runnableTests = require('./runnableTestsResolver');
const runnableTestsLength = require('./runnableTestsLengthResolver');
const draftTestPlanRuns = require('./draftTestPlanRunsResolver');
const finalizedTestResults = require('./finalizedTestResultsResolver');
const conflicts = require('./conflictsResolver');
const conflictsLength = require('./conflictsLengthResolver');
const issues = require('./issuesResolver');
const recommendedStatusTargetDate = require('./recommendedStatusTargetDateResolver');
const atVersions = require('./atVersionsResolver');
const latestAtVersionReleasedAt = require('./latestAtVersionReleasedAtResolver');

module.exports = {
    runnableTests,
    runnableTestsLength,
    draftTestPlanRuns,
    finalizedTestResults,
    conflicts,
    conflictsLength,
    issues,
    recommendedStatusTargetDate,
    atVersions,
    latestAtVersionReleasedAt
};
