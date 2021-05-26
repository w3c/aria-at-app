const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const RoleModel = require('../../models/Role');

describe('RoleModel', () => {
    // A1
    const Model = RoleModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('Role');

    describe('properties', () => {
        // A3
        ['name'].forEach(checkPropertyExists(modelInstance));
    });
});
