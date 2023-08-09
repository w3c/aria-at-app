const assignTester = require('./assignTesterResolver');
const deleteTestPlanRun = require('./deleteTestPlanRunResolver');
const markAsFinal = require('./markAsFinalResolver');
const unmarkAsFinal = require('./unmarkAsFinalResolver');
const deleteTestPlanReport = require('./deleteTestPlanReportResolver');
const promoteVendorReviewStatus = require('./promoteVendorReviewStatusResolver');
const updateTestPlanReportTestPlanVersion = require('./updateTestPlanReportTestPlanVersionResolver');

module.exports = {
    assignTester,
    deleteTestPlanRun,
    markAsFinal,
    unmarkAsFinal,
    deleteTestPlanReport,
    promoteVendorReviewStatus,
    updateTestPlanReportTestPlanVersion
};
