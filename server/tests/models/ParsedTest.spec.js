/* eslint-disable jest/valid-expect */
const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const { expect, match } = require('./_modelsTestHelper');

const ParsedTestModel = require('../../models/ParsedTest');
const TestPlanModel = require('../../models/TestPlan');

// ParsedTest no longer required for now. Skipping tests
describe.only('Skip Deprecated ParsedTestModel', () => {
    it('skips deprecated ParsedTestModel Suite', () => {
        expect(true).to.equal(true);
    });
});

describe('ParsedTestModel', () => {
    // A1
    const Model = ParsedTestModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('ParsedTest');

    describe('properties', () => {
        // A3
        [
            'title',
            'minimumInputCount',
            'maximumInputCount',
            'sourceSteps'
        ].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const TEST_PLAN_ASSOCIATION = { as: 'testPlan' };

        // A2
        beforeEach(() => {
            // Model.associate({ TestPlan });
            Model.hasOne(TestPlanModel, TEST_PLAN_ASSOCIATION);
        });

        it('defined a hasOne association with TestPlan', () => {
            // A3
            expect(Model.belongsTo).to.have.been.calledWith(
                TestPlanModel,
                match(TEST_PLAN_ASSOCIATION)
            );
        });
    });
});
