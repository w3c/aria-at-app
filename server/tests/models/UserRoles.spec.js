const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const UserRolesModel = require('../../models/UserRoles');

describe('UserRolesModel', () => {
    // A1
    const Model = UserRolesModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('UserRoles');

    describe('properties', () => {
        // A3
        ['userId', 'roleName'].forEach(checkPropertyExists(modelInstance));
    });
});
