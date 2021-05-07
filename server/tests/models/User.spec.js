/* eslint-disable jest/valid-expect */
const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const { expect, match } = require('./_modelsTestHelper');

const UserModel = require('../../models/User');
const RoleModel = require('../../models/Role');
const TestPlanRunModel = require('../../models/TestPlanRun');

describe('UserModel Schema Checks', () => {
    // A1
    const Model = UserModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('User');

    describe('properties', () => {
        // A3
        ['username'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const ROLE_ASSOCIATION = { through: 'UserRoles', as: 'roles' };
        const USER_ASSOCIATION = { as: 'tester' };

        // A2
        beforeAll(() => {
            Model.belongsToMany(RoleModel, ROLE_ASSOCIATION);
            Model.hasOne(UserModel, USER_ASSOCIATION); // this association will add 'tester' to the target model
        });

        // A3
        it('defined a belongsToMany association with Role', () => {
            // expect(Model.belongsToMany).toHaveBeenCalledWith(RoleModel, {
            expect(Model.belongsToMany).to.have.been.calledWith(
                RoleModel,
                match(ROLE_ASSOCIATION) // check if association options on the model contains a subset of the association object
            );
        });

        it('defined a hasOne association with User', () => {
            expect(Model.hasOne).to.have.been.calledWith(
                TestPlanRunModel,
                match(USER_ASSOCIATION)
            );
        });
    });
});
