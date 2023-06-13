const {
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

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
                ['candidateStatusReachedAt', 'desc'],
                ['updatedAt', 'desc'],
                ['title', 'asc'],
                ['directory', 'asc']
            ]
        }
    );
};

module.exports = testPlanVersionsResolver;
