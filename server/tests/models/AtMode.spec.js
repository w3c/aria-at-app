const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const AtModeModel = require('../../models/AtMode');

describe('AtModeModel', () => {
    // A1
    const Model = AtModeModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('AtMode');

    describe('properties', () => {
        // A3
        ['at', 'name'].forEach(checkPropertyExists(modelInstance));
    });
});
