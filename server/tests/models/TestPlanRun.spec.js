const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanRunModel = require('../../models/TestPlanRun');
const TestPlanReportModel = require('../../models/TestPlanReport');
const UserModel = require('../../models/User');

describe('TestPlanRunModel', () => {
    // A1
    const Model = TestPlanRunModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestPlanRun');

    describe('properties', () => {
        // A3
        ['testerUserId', 'testPlanReportId', 'testResults'].forEach(
            checkPropertyExists(modelInstance)
        );
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_REPORT_ASSOCIATION = { foreignKey: 'testPlanReportId' };
        const USER_ASSOCIATION = { foreignKey: 'testerUserId' };

        // A2
        beforeAll(() => {
            Model.belongsTo(TestPlanReportModel, TEST_PLAN_REPORT_ASSOCIATION);
            Model.belongsTo(UserModel, USER_ASSOCIATION);
        });

        it('defined a belongsTo association with TestPlanReport', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                TestPlanReportModel,
                expect.objectContaining(Model.TEST_PLAN_REPORT_ASSOCIATION)
            );
        });

        it('defined a belongsTo association with User', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                UserModel,
                expect.objectContaining(Model.USER_ASSOCIATION)
            );
        });
    });
});
