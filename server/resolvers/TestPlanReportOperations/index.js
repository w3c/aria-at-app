const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const updateStatus = require('./updateStatusResolver');
const updateRecommendedStatusTargetDate = require('./updateRecommendedStatusTargetDateResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    updateStatus,
    updateRecommendedStatusTargetDate,
    deleteTestPlanReport
};
