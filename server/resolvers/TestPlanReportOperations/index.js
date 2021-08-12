const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const deleteTestPlanRunResults = require('./deleteTestPlanRunResultsResolver');
const updateStatus = require('./updateStatusResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    deleteTestPlanRunResults,
    updateStatus
};
