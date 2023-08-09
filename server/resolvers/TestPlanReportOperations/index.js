const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const markAsFinal = require('./markAsFinalResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');
const promoteVendorReviewStatus = require('./promoteVendorReviewStatusResolver');
const updateTestPlanReportTestPlanVersion = require('./updateTestPlanReportTestPlanVersionResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    markAsFinal,
    deleteTestPlanReport,
    promoteVendorReviewStatus,
    updateTestPlanReportTestPlanVersion
};
