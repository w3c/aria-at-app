const {
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const promoteVendorReviewStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { vendorReviewStatus }
) => {
    let values = { vendorReviewStatus };

    if (vendorReviewStatus === 'READY') {
        values = {
            vendorReviewStatus: 'IN_PROGRESS'
        };
    } else if (vendorReviewStatus === 'IN_PROGRESS') {
        values = {
            vendorReviewStatus: 'APPROVED'
        };
    }

    if (vendorReviewStatus !== 'APPROVED') {
        await updateTestPlanReportById({ id: testPlanReportId, values });
    }

    return populateData({ testPlanReportId });
};

module.exports = promoteVendorReviewStatusResolver;
