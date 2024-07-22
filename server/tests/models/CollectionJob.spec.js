const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const CollectionJobModel = require('../../models/CollectionJob');

describe('CollectionJobModel', () => {
  // A1
  const Model = CollectionJobModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2
  checkModelName(Model)('CollectionJob');

  // A3
  describe('properties', () => {
    ['id', 'status', 'testPlanRunId'].forEach(
      checkPropertyExists(modelInstance)
    );
  });

  describe('associations', () => {
    // A1
    const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRun' };

    // A2
    beforeAll(() => {
      Model.hasOne(TEST_PLAN_RUN_ASSOCIATION);
    });

    it('defined a hasOne association with TestPlanRun', () => {
      // A3
      expect(Model.hasOne).toHaveBeenCalledWith(
        expect.objectContaining(TEST_PLAN_RUN_ASSOCIATION)
      );
    });
  });
});
