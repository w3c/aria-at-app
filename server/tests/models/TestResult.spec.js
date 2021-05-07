/* eslint-disable jest/valid-expect */
const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const { expect, match } = require('./_modelsTestHelper');

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
        [
            'startedAt',
            'completedAt',
            'atMode',
            'nthInput',
            'sourceSteps',
            'steps',
            'stepResults',
            'supportLevel',
            'testPlanRun'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRun' };

        // A2
        beforeEach(() => {
            // Model.associate({ TestPlanRun });
            Model.belongsTo(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
        });

        it('defined a belongsTo association with TestPlanRun', () => {
            // A3
            expect(Model.belongsTo).to.have.been.calledWith(
                TestPlanRunModel,
                match(TEST_PLAN_RUN_ASSOCIATION)
            );
        });
    });
});
