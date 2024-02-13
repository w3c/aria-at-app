const {
    getTestPlanVersions
} = require('../models/services.deprecated/TestPlanVersionService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const {
    TEST_PLAN_VERSION_ATTRIBUTES
} = require('../models/services.deprecated/helpers');

const testPlanVersionsResolver = async (_, { phases }, context, info) => {
    const where = {};
    if (phases) where.phase = phases;

    const { attributes: testPlanVersionAttributes } = retrieveAttributes(
        'testPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info
    );

    return getTestPlanVersions(
        null,
        where,
        testPlanVersionAttributes,
        [],
        [],
        [],
        [],
        [],
        {
            order: [
                ['candidatePhaseReachedAt', 'desc'],
                ['updatedAt', 'desc'],
                ['title', 'asc'],
                ['directory', 'asc']
            ]
        }
    );
};

module.exports = testPlanVersionsResolver;
