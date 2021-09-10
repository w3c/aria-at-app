const {
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');

const testPlanVersionsResolver = async () => {
    return getTestPlanVersions(null, {}, null, null, null, null, null, {
        order: [
            ['updatedAt', 'desc'],
            ['title', 'asc'],
            ['metadata.directory', 'asc']
        ]
    });
};

module.exports = testPlanVersionsResolver;
