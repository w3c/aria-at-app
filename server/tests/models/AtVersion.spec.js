const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const AtVersionModel = require('../../models/AtVersion');

describe('AtVersionModel', () => {
    // A1
    const Model = AtVersionModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('AtVersion');

    describe('properties', () => {
        // A3
        ['version'].forEach(checkPropertyExists(modelInstance));
    });
});
