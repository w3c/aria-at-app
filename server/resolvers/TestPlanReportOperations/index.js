const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const updateStatus = require('./updateStatusResolver');
const bulkUpdateStatus = require('./bulkUpdateStatusResolver');
const updateRecommendedStatusTargetDate = require('./updateRecommendedStatusTargetDateResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');
const promoteVendorReviewStatus = require('./promoteVendorReviewStatusResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    updateStatus,
    bulkUpdateStatus,
    updateRecommendedStatusTargetDate,
    deleteTestPlanReport,
    promoteVendorReviewStatus
};
