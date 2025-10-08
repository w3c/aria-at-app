const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const AtBugModel = require('../../models/AtBug');
const AtModel = require('../../models/At');
const AssertionModel = require('../../models/Assertion');

describe('AtBugModel', () => {
  // A1 - init
  const Model = AtBugModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2 - model name
  checkModelName(Model)('AtBug');

  describe('properties', () => {
    // A3 - properties
    ['title', 'bugId', 'url', 'atId'].forEach(
      checkPropertyExists(modelInstance)
    );
  });

  describe('associations', () => {
    const AT_ASSOCIATION = { foreignKey: 'atId', as: 'at' };
    const ASSERTIONS_ASSOCIATION = {
      through: 'AssertionAtBug',
      as: 'assertions'
    };

    beforeAll(() => {
      Model.belongsTo(AtModel, AT_ASSOCIATION);
      Model.belongsToMany(AssertionModel, ASSERTIONS_ASSOCIATION);
    });

    it('defined a belongsTo association with At', () => {
      expect(Model.belongsTo).toHaveBeenCalledWith(
        AtModel,
        expect.objectContaining(AT_ASSOCIATION)
      );
    });

    it('defined a belongsToMany association with Assertion', () => {
      expect(Model.belongsToMany).toHaveBeenCalledWith(
        AssertionModel,
        expect.objectContaining(ASSERTIONS_ASSOCIATION)
      );
    });
  });
});
