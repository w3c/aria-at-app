const draftTestPlanRuns = require('./draftTestPlanRunsResolver');
const finalizedTestPlanRun = require('./finalizedTestPlanRunResolver');
const conflicts = require('./conflictsResolver');

module.exports = {
    draftTestPlanRuns,
    finalizedTestPlanRun,
    conflicts
};
