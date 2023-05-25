const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const promoteVendorReviewStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { vendorReviewStatus },
    context
) => {
    let updateParams = { vendorReviewStatus };

    if (vendorReviewStatus === 'READY') {
        updateParams = {
            vendorReviewStatus: 'IN_PROGRESS'
        };
    } else if (vendorReviewStatus === 'IN_PROGRESS') {
        updateParams = {
            vendorReviewStatus: 'APPROVED'
        };
    }

    if (vendorReviewStatus !== 'APPROVED') {
        await updateTestPlanReport(testPlanReportId, updateParams);
    }

    return populateData({ testPlanReportId }, { context });
};

module.exports = promoteVendorReviewStatusResolver;
