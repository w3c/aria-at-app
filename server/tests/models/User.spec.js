const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const UserModel = require('../../models/User');
const RoleModel = require('../../models/Role');
const TestPlanRunModel = require('../../models/TestPlanRun');
const VendorModel = require('../../models/Vendor');

describe('UserModel Schema Checks', () => {
  // A1
  const Model = UserModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2
  checkModelName(Model)('User');

  describe('properties', () => {
    // A3
    ['username', 'isBot', 'createdAt', 'updatedAt'].forEach(
      checkPropertyExists(modelInstance)
    );
  });

  describe('associations', () => {
    // A1
    const ROLE_ASSOCIATION = { through: 'UserRoles', as: 'roles' };
    const TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };
    const VENDOR_ASSOCIATION = { as: 'company' };

    // A2
    beforeAll(() => {
      Model.belongsToMany(RoleModel, ROLE_ASSOCIATION);
      Model.hasMany(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION);
      Model.belongsTo(VendorModel, VENDOR_ASSOCIATION);
    });

    // A3
    it('defined a belongsToMany association with Role', () => {
      expect(Model.belongsToMany).toHaveBeenCalledWith(
        RoleModel,
        expect.objectContaining(Model.ROLE_ASSOCIATION)
      );
    });

    it('defined a hasMany association with TestPlanRun', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        TestPlanRunModel,
        expect.objectContaining(Model.TEST_PLAN_RUN_ASSOCIATION)
      );
    });

    it('defined a belongsTo association with Vendor', () => {
      expect(Model.belongsTo).toHaveBeenCalledWith(
        VendorModel,
        expect.objectContaining(Model.VENDOR_ASSOCIATION)
      );
    });
  });
});
