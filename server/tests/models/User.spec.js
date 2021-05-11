const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

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
        const TEST_PLAN_RUN_ASSOCIATION = { as: 'tester' };

        // A2
        beforeAll(() => {
            Model.belongsToMany(RoleModel, ROLE_ASSOCIATION);
            Model.hasOne(TestPlanRunModel, TEST_PLAN_RUN_ASSOCIATION); // this association will add 'tester' to the target model
        });

        // A3
        it('defined a belongsToMany association with Role', () => {
            expect(Model.belongsToMany).toHaveBeenCalledWith(
                RoleModel,
                expect.objectContaining(Model.ROLE_ASSOCIATION)
            );
        });

        it('defined a hasOne association with TestPlanRun', () => {
            expect(Model.hasOne).toHaveBeenCalledWith(
                TestPlanRunModel,
                expect.objectContaining(Model.TEST_PLAN_RUN_ASSOCIATION)
            );
        });
    });
});
