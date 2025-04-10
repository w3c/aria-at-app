const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const UpdateEventModel = require('../../models/UpdateEvent');

describe('UpdateEventModel', () => {
  const Model = UpdateEventModel(sequelize, dataTypes);
  const modelInstance = new Model();

  checkModelName(Model)('UpdateEvent');

  describe('properties', () => {
    ['id', 'timestamp', 'description', 'type'].forEach(
      checkPropertyExists(modelInstance)
    );
  });
});
