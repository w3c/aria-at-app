const {
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

const testPlanVersionsResolver = async (root, args, context, info) => {
    const { attributes: testPlanVersionAttributes } = retrieveAttributes(
        'testPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info
    );

    return getTestPlanVersions(
        null,
        {},
        testPlanVersionAttributes,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        {
            order: [
                ['updatedAt', 'desc'],
                ['title', 'asc'],
                ['directory', 'asc']
            ]
        }
    );
};

module.exports = testPlanVersionsResolver;
