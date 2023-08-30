const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const CollectionJobModel = require('../../models/CollectionJob');

describe('BrowserVersionModel', () => {
    // A1
    const Model = CollectionJobModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('CollectionJob');

    // A3
    describe('properties', () => {
        ['id', 'status'].forEach(checkPropertyExists(modelInstance));
    });
});
