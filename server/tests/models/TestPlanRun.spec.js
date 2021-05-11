const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanRunModel = require('../../models/TestPlanRun');
const TestResultModel = require('../../models/TestResult');
const TestPlanReportModel = require('../../models/TestPlanReport');

describe('TestPlanRunModel', () => {
    // A1
    const Model = TestPlanRunModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestPlanRun');

    describe('properties', () => {
        // A3
        ['isManuallyTested', 'tester', 'testPlanReport'].forEach(
            checkPropertyExists(modelInstance)
        );
    });

    describe('associations', () => {
        // A1
        const TEST_RESULT_ASSOCIATION = { as: 'testResults' };
        const TEST_PLAN_REPORT_ASSOCIATION = { as: 'testPlanReport' };

        // A2
        beforeEach(() => {
            Model.hasMany(TestResultModel, TEST_RESULT_ASSOCIATION);
            Model.belongsTo(TestPlanReportModel, TEST_PLAN_REPORT_ASSOCIATION);
        });

        it('defined a hasMany association with TestResult', () => {
            // A3
            expect(Model.hasMany).toHaveBeenCalledWith(
                TestResultModel,
                expect.objectContaining(Model.TEST_RESULT_ASSOCIATION)
            );
        });

        it('defined a belongsTo association with TestPlanReport', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanReportModel,
                expect.objectContaining(Model.TEST_PLAN_REPORT_ASSOCIATION)
            );
        });
    });
});
