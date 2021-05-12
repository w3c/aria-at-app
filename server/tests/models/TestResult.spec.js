const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestResultModel = require('../../models/TestResult');
const TestPlanRunModel = require('../../models/TestPlanRun');

describe('TestResultModel', () => {
    // A1
    const Model = TestResultModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestResult');

    describe('properties', () => {
        // A3
        ['startedAt', 'completedAt', 'testPlanRun', 'data'].forEach(
            checkPropertyExists(modelInstance)
        );
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_RUN_ASSOCIATION = { foreignKey: 'testPlanRun' };

        // A2
        beforeAll(() => {
            Model.belongsTo(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association with TestPlanRun', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanRunModel,
                expect.objectContaining(Model.TEST_PLAN_RUN_ASSOCIATION)
            );
        });
    });
});
