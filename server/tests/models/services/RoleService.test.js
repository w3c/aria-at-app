const { sequelize, Role } = require('../../../models');

describe('RoleModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close(); // close connection to database
    });

    it('should have name valid role name (admin)', () => {
        return Role.findOne({
            where: { name: 'admin' }
        }).then(role => {
            const name = role.get('name');

            expect(name).toEqual('admin');
        });
    });

    it('should have name valid role name (tester)', () => {
        return Role.findOne({
            where: { name: 'tester' }
        }).then(role => {
            const name = role.get('name');

            expect(name).toEqual('tester');
        });
    });

    it('should only have 2 roles (admin & tester)', () => {
        return Role.findAll({}).then(roles => {
            expect(roles.length).toEqual(2);
            expect(roles).toContainEqual(
                expect.objectContaining({ name: 'admin' })
            );
            expect(roles).toContainEqual(
                expect.objectContaining({ name: 'tester' })
            );
        });
    });

    it('should fail if no valid role name exists', () => {
        return Role.findOne({
            where: { name: 'guest' }
        }).then(role => {
            expect(role).toBeNull();
        });
    });
});
