const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const AuditModel = require('../../models/Audit');
const UserModel = require('../../models/User');

describe('AuditModel Schema Checks', () => {
  // A1
  const Model = AuditModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2
  checkModelName(Model)('Audit');

  describe('properties', () => {
    // A3
    [
      'id',
      'eventType',
      'description',
      'performedByUserId',
      'entityId',
      'metadata',
      'createdAt'
    ].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    // A1
    const PERFORMED_BY_USER_ASSOCIATION = { foreignKey: 'performedByUserId' };

    // A2
    beforeAll(() => {
      Model.belongsTo(UserModel, {
        ...PERFORMED_BY_USER_ASSOCIATION,
        targetKey: 'id',
        as: 'performedBy'
      });
    });

    // A3
    it('defined a belongsTo association with User', () => {
      expect(Model.belongsTo).toHaveBeenCalledWith(
        UserModel,
        expect.objectContaining(Model.PERFORMED_BY_USER_ASSOCIATION)
      );
    });
  });
});
