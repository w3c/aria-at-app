const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanReportModel = require('../../models/TestPlanReport');
const TestPlanVersionModel = require('../../models/TestPlanVersion');
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
            'testPlanTargetId',
            'testPlanVersionId',
            'coveragePercent',
            'createdAt'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_VERSION_ASSOCIATION = {
            foreignKey: 'testPlanVersionId'
        };
        const TEST_PLAN_TARGET_ASSOCIATION = { foreignKey: 'testPlanTargetId' };
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

        // A2
        beforeAll(() => {
            Model.belongsTo(
                TestPlanVersionModel,
                TEST_PLAN_VERSION_ASSOCIATION
            );
            Model.belongsTo(TestPlanTargetModel, TEST_PLAN_TARGET_ASSOCIATION);
            Model.hasMany(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association to TestPlanVersion', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanVersionModel,
                expect.objectContaining(Model.TEST_PLAN_VERSION_ASSOCIATION)
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
