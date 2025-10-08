const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const NegativeSideEffectModel = require('../../models/NegativeSideEffect');
const TestPlanRunModel = require('../../models/TestPlanRun');
const AtBugModel = require('../../models/AtBug');

describe('NegativeSideEffectModel', () => {
  // A1
  const Model = NegativeSideEffectModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2
  checkModelName(Model)('NegativeSideEffect');

  describe('properties', () => {
    // A3
    [
      'testPlanRunId',
      'testResultId',
      'scenarioResultId',
      'negativeSideEffectId',
      'impact',
      'details',
      'highlightRequired'
    ].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    // A1
    const TEST_PLAN_RUN_ASSOCIATION = { foreignKey: 'testPlanRunId' };
    const AT_BUGS_ASSOCIATION = {
      through: 'NegativeSideEffectAtBug',
      as: 'atBugs'
    };

    // A2
    beforeAll(() => {
      Model.belongsTo(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
      Model.belongsToMany(AtBugModel, AT_BUGS_ASSOCIATION);
    });

    it('defined a belongsTo association with TestPlanRun', () => {
      // A3
      expect(Model.belongsTo).toHaveBeenCalledWith(
        TestPlanRunModel,
        expect.objectContaining(Model.TEST_PLAN_RUN_ASSOCIATION)
      );
    });

    it('defined a belongsToMany association with AtBug', () => {
      // A3
      expect(Model.belongsToMany).toHaveBeenCalledWith(
        AtBugModel,
        expect.objectContaining(Model.AT_BUGS_ASSOCIATION)
      );
    });
  });
});
