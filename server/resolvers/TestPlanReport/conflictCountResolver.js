const { findTestPlanReportConflicts } = require('../utilities');

const conflictCountResolver = (parent) => {
    const conflicts = findTestPlanReportConflicts(parent);
    return conflicts.length;
};

module.exports = conflictCountResolver;
