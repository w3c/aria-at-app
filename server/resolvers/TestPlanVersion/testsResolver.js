const { At } = require('../../models');
const { remapTest } = require('../../scripts/import-tests/remapTest');

const testsResolver = async testPlanVersion => {
    // TODO: run this remapping before saving to database, so this resolver is
    // not needed.
    const allAts = await At.findAll();
    return testPlanVersion.tests.map(test =>
        remapTest(test, { testPlanVersionId: testPlanVersion.id, allAts })
    );
};

module.exports = testsResolver;
