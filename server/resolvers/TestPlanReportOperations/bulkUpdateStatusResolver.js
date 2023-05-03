const { AuthenticationError } = require('apollo-server');
const updateStatusResolver = require('./updateStatusResolver');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    getTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const bulkUpdateStatusResolver = async (
    { parentContext: { ids } },
    { status },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let populateDataResultArray = [];
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        const testPlanReport = await getTestPlanReportById(id);
        const conflicts = await conflictsResolver(
            testPlanReport,
            null,
            context
        );
        if (conflicts.length > 0) {
            throw new Error(
                `Cannot update test plan report due to conflicts with the ${testPlanReport.at.name} report.`
            );
        }

        const result = await updateStatusResolver(
            { parentContext: { id } },
            { status },
            context
        );
        populateDataResultArray.push(result);
    }

    return populateDataResultArray;
};

module.exports = bulkUpdateStatusResolver;
