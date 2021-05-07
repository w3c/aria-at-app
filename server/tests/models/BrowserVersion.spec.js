const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const BrowserVersionModel = require('../../models/BrowserVersion');

describe('BrowserVersionModel', () => {
    // A1
    const Model = BrowserVersionModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('BrowserVersion');

    describe('properties', () => {
        // A3
        ['version'].forEach(checkPropertyExists(modelInstance));
    });
});
