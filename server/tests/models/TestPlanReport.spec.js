const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanReportModel = require('../../models/TestPlanReport');
const TestPlanModel = require('../../models/TestPlan');
const TestPlanTargetModel = require('../../models/TestPlanTarget');
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
            'testPlanTarget',
            'testPlan',
            'coveragePercent',
            'createdAt'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_ASSOCIATION = { foreignKey: 'testPlan' };
        const TEST_PLAN_TARGET_ASSOCIATION = { foreignKey: 'testPlanTarget' };
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

        // A2
        beforeEach(() => {
            Model.belongsTo(TestPlanModel, TEST_PLAN_ASSOCIATION);
            Model.belongsTo(TestPlanTargetModel, TEST_PLAN_TARGET_ASSOCIATION);
            Model.hasMany(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association to TestPlan', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanModel,
                expect.objectContaining(Model.TEST_PLAN_ASSOCIATION)
            );
        });

        it('defined a belongsTo association to TestPlanTarget', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanTargetModel,
                expect.objectContaining(Model.TEST_PLAN_TARGET_ASSOCIATION)
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
