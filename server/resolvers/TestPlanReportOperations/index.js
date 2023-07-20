const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const updateApprovedAt = require('./updateApprovedAtResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');
const promoteVendorReviewStatus = require('./promoteVendorReviewStatusResolver');
const updateTestPlanReportTestPlanVersion = require('./updateTestPlanReportTestPlanVersionResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    updateApprovedAt,
    deleteTestPlanReport,
    promoteVendorReviewStatus,
    updateTestPlanReportTestPlanVersion
};
