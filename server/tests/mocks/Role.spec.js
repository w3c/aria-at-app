const SequelizeMock = require('sequelize-mock');
const mockRoles = require('../mock-data/roles.json');

const adminMockRole = mockRoles[0];
const testerMockRole = mockRoles[1];
const invalidMockRole = mockRoles[2];

const DBConnectionMock = new SequelizeMock();
const RoleMock = DBConnectionMock.define('role', adminMockRole);

describe('RoleModel Data Checks', () => {
    it('should have name property', () => {
        return RoleMock.findOne({
            where: { name: 'admin' }
        }).then(role => {
            expect(role).toHaveProperty('name');
        });
    });

    it('should have name valid role name (admin)', () => {
        return RoleMock.findOne({
            where: { name: 'admin' }
        }).then(role => {
            const name = role.get('name');

            expect(name).toEqual('admin');
        });
    });

    it('should have name valid role name (tester)', () => {
        return RoleMock.findOne({
            where: { name: 'tester' }
        }).then(role => {
            expect(testerMockRole.name).toEqual('tester');
        });
    });

    it('should fail if no valid name property exists', () => {
        return RoleMock.findOne({
            where: { name: 'guest' }
        }).then(role => {
            expect(invalidMockRole).not.toHaveProperty('name');
        });
    });
});
