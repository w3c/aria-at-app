const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const AssertionModel = require('../../models/Assertion');
const TestPlanVersionModel = require('../../models/TestPlanVersion');

describe('AssertionModel', () => {
  const Model = AssertionModel(sequelize, dataTypes);
  const modelInstance = new Model();

  checkModelName(Model)('Assertion');

  describe('properties', () => {
    [
      'testPlanVersionId',
      'testId',
      'assertionIndex',
      'priority',
      'text',
      'rawAssertionId',
      'assertionStatement',
      'assertionPhrase',
      'assertionExceptions',
      'encodedId'
    ].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    const TEST_PLAN_VERSION_ASSOCIATION = {
      foreignKey: 'testPlanVersionId',
      as: 'testPlanVersion'
    };

    beforeAll(() => {
      Model.belongsTo(TestPlanVersionModel, TEST_PLAN_VERSION_ASSOCIATION);
    });

    it('defined a belongsTo association with TestPlanVersion', () => {
      expect(Model.belongsTo).toHaveBeenCalledWith(
        TestPlanVersionModel,
        expect.objectContaining(TEST_PLAN_VERSION_ASSOCIATION)
      );
    });
  });
});
