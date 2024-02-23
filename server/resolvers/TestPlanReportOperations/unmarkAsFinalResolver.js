const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const unmarkAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user, t } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanReportById({
        id: testPlanReportId,
        values: { markedFinalAt: null },
        t
    });

    return populateData({ testPlanReportId });
};

module.exports = unmarkAsFinalResolver;
