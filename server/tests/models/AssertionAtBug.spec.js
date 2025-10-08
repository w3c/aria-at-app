const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const AssertionAtBugModel = require('../../models/AssertionAtBug');

// The join model is simple; ensure fields exist and name is correct

describe('AssertionAtBugModel', () => {
  const Model = AssertionAtBugModel(sequelize, dataTypes);
  const modelInstance = new Model();

  checkModelName(Model)('AssertionAtBug');

  describe('properties', () => {
    ['assertionId', 'atBugId'].forEach(checkPropertyExists(modelInstance));
  });
});
