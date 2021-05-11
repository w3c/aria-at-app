const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanReportModel = require('../../models/TestPlanReport');
const TestPlanModel = require('../../models/TestPlan');
const TestedConfigurationModel = require('../../models/TestedConfiguration');
const TestPlanRunModel = require('../../models/TestPlanRun');

describe('TestPlanReportModel', () => {
    // A1
    const Model = TestPlanReportModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestPlanReport');

    describe('properties', () => {
        // A3
        [
            'publishStatus',
            'testedConfiguration',
            'testPlan',
            'createdAt'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_ASSOCIATION = { as: 'testPlan' };
        const TESTED_CONFIGURATION_ASSOCIATION = { as: 'testedConfiguration' };
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

        // A2
        beforeEach(() => {
            Model.belongsTo(TestPlanModel, TEST_PLAN_ASSOCIATION);
            Model.belongsTo(
                TestedConfigurationModel,
                TESTED_CONFIGURATION_ASSOCIATION
            );
            Model.hasMany(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association to TestPlan', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanModel,
                expect.objectContaining(Model.TEST_PLAN_ASSOCIATION)
            );
        });

        it('defined a belongsTo association to TestedConfiguration', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestedConfigurationModel,
                expect.objectContaining(Model.TESTED_CONFIGURATION_ASSOCIATION)
            );
        });

        it('defined a hasMany association with TestPlanRun', () => {
            // A3
            expect(Model.hasMany).toHaveBeenCalledWith(
                TestPlanRunModel,
                expect.objectContaining(Model.TEST_PLAN_RUN_ASSOCIATION)
            );
        });
    });
});
