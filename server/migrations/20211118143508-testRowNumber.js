const { omit } = require('lodash');
const { TestPlanVersion } = require('../models');

module.exports = {
    up: async queryInterface => {
        const [[{ count: testPlanVersionCount }]] =
            await queryInterface.sequelize.query(
                `SELECT COUNT(*) FROM "TestPlanVersion"`
            );
        if (!Number(testPlanVersionCount)) return;

        const testPlanVersions = await TestPlanVersion.findAll({
            attributes: {
                exclude: [
                    'testPlanId',
                    'phase',
                    'candidatePhaseReachedAt',
                    'recommendedPhaseReachedAt',
                    'recommendedPhaseTargetDate'
                ]
            }
        });
        await Promise.all(
            testPlanVersions.map(testPlanVersion => {
                const newTests = testPlanVersion.tests.map((test, index) => {
                    const number = index + 1;
                    const anyAtId = test.atIds[0];
                    const { testId } = test.renderableContent[anyAtId].info;
                    if (testId !== number) throw new Error('Unexpected');
                    return {
                        ...test,
                        rowNumber: testId
                    };
                });
                testPlanVersion.tests = newTests;
                return testPlanVersion.save();
            })
        );
    },

    down: async () => {
        const testPlanVersions = await TestPlanVersion.findAll({
            attributes: {
                exclude: [
                    'testPlanId',
                    'phase',
                    'candidatePhaseReachedAt',
                    'recommendedPhaseReachedAt',
                    'recommendedPhaseTargetDate'
                ]
            }
        });
        await Promise.all(
            testPlanVersions.map(testPlanVersion => {
                const newTests = testPlanVersion.tests.map(test => {
                    return omit(test, ['rowNumber']);
                });
                testPlanVersion.tests = newTests;
                return testPlanVersion.save();
            })
        );
    }
};
