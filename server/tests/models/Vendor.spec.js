const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const VendorModel = require('../../models/Vendor');
const AtModel = require('../../models/At');
const UserModel = require('../../models/User');

describe('VendorModel', () => {
  const Model = VendorModel(sequelize, dataTypes);
  const modelInstance = new Model();

  checkModelName(Model)('Vendor');

  describe('properties', () => {
    ['name'].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    const AT_ASSOCIATION = { as: 'ats' };
    const USER_ASSOCIATION = { as: 'users' };

    beforeAll(() => {
      Model.hasMany(AtModel, AT_ASSOCIATION);
      Model.hasMany(UserModel, USER_ASSOCIATION);
    });

    it('defined a hasMany association with At', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        AtModel,
        expect.objectContaining(Model.AT_ASSOCIATION)
      );
    });

    it('defined a hasMany association with User', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        UserModel,
        expect.objectContaining(Model.USER_ASSOCIATION)
      );
    });
  });
});
