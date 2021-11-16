const { omit } = require('lodash');
const { TestPlanVersion } = require('../models');

module.exports = {
    up: async (/* queryInterface, Sequelize */) => {
        const testPlanVersions = await TestPlanVersion.findAll();
        await Promise.all(
            testPlanVersions.map(testPlanVersion => {
                const newTests = testPlanVersion.tests.map(test => ({
                    ...test,
                    scenarios: test.scenarios.map(scenario => ({
                        ...omit(scenario, ['commandId']),
                        commandIds: [scenario.commandId]
                    }))
                }));
                testPlanVersion.tests = newTests;
                return testPlanVersion.save();
            })
        );
    }
};
