const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
    removeTestPlanRunByQuery
} = require('../../models/services.deprecated/TestPlanRunService');

const deleteTestPlanReportResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await removeTestPlanRunByQuery({
        where: { testPlanReportId },
        transaction
    });
    await removeTestPlanReportById({ id: testPlanReportId, transaction });

    return true;
};

module.exports = deleteTestPlanReportResolver;
