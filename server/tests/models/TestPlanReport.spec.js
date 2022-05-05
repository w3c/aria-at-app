const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanReportModel = require('../../models/TestPlanReport');
const TestPlanVersionModel = require('../../models/TestPlanVersion');
const AtModel = require('../../models/At');
const BrowserModel = require('../../models/Browser');
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
            'status',
            'testPlanTargetId',
            'testPlanVersionId',
            'createdAt'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_VERSION_ASSOCIATION = {
            foreignKey: 'testPlanVersionId'
        };
        const AT_ASSOCIATION = { foreignKey: 'atId' };
        const BROWSER_ASSOCIATION = { foreignKey: 'browserId' };
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

        // A2
        beforeAll(() => {
            Model.belongsTo(
                TestPlanVersionModel,
                TEST_PLAN_VERSION_ASSOCIATION
            );
            Model.belongsTo(AtModel, AT_ASSOCIATION);
            Model.belongsTo(BrowserModel, BROWSER_ASSOCIATION);
            Model.hasMany(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association to TestPlanVersion', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanVersionModel,
                expect.objectContaining(Model.TEST_PLAN_VERSION_ASSOCIATION)
            );
        });

        it('defined a belongsTo association to AT', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                AtModel,
                expect.objectContaining(Model.AT_ASSOCIATION)
            );
        });

        it('defined a belongsTo association to Browser', () => {
            expect(Model.belongsTo).toHaveBeenCalledWith(
                BrowserModel,
                expect.objectContaining(Model.BROWSER_ASSOCIATION)
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
