const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const updateStatus = require('./updateStatusResolver');
const bulkUpdateStatus = require('./bulkUpdateStatusResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');
const promoteVendorReviewStatus = require('./promoteVendorReviewStatusResolver');
const updateTestPlanReportTestPlanVersion = require('./updateTestPlanReportTestPlanVersionResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    updateStatus,
    bulkUpdateStatus,
    deleteTestPlanReport,
    promoteVendorReviewStatus,
    updateTestPlanReportTestPlanVersion
};
