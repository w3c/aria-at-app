const { sequelize } = require('../../../models');
const RoleService = require('../../../models/services/RoleService');
const UserService = require('../../../models/services/UserService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

describe('RoleModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should have valid role named `ADMIN`', async () => {
        const _name = 'ADMIN';

        const role = await RoleService.getRoleByName(_name);
        const { name } = role;

        expect(name).toEqual(_name);
    });

    it('should contain valid role with users array', async () => {
        const _name = 'ADMIN';

        const role = await RoleService.getRoleByName(_name);
        const { name } = role;

        expect(name).toEqual(_name);
        expect(role).toHaveProperty('users');
        expect(role.users).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    username: expect.any(String)
                })
            ])
        );
    });

    it('should contain valid role with no users array', async () => {
        const _name = 'ADMIN';

        const role = await RoleService.getRoleByName(_name, null, []);
        const { name } = role;

        expect(name).toEqual(_name);
        expect(role).not.toHaveProperty('users');
    });

    it('should have valid role named `TESTER`', async () => {
        const _name = 'TESTER';

        const role = await RoleService.getRoleByName(_name);
        const { name } = role;

        expect(name).toEqual(_name);
    });

    it('should only have 3 named roles (ADMIN, TESTER, and VENDOR)', async () => {
        const roles = await RoleService.getRoles('');

        expect(roles.length).toEqual(3);
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'ADMIN' })
        );
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'TESTER' })
        );
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'VENDOR' })
        );
    });

    it('should not return role for unknown role name', async () => {
        const _name = 'guest';

        const role = await RoleService.getRoleByName(_name);

        expect(role).toBeNull();
    });

    it('should create, update and add a user to a new role', async () => {
        await dbCleaner(async () => {
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();
            const _user = 2;

            const role = await RoleService.createRole({ name: _name });
            const { name, users } = role;

            const updatedRole = await RoleService.updateRole(_name, {
                name: _updatedName
            });
            const { name: updatedName, users: updatedUsers } = updatedRole;

            await UserService.addUserToRole(_user, updatedName);

            const addedUserRole = await RoleService.getRoleByName(updatedName);
            const { name: addedUserRoleName, users: addedUserRoleUsers } =
                addedUserRole;

            // after role created
            expect(name).toEqual(_name);
            expect(users).toHaveLength(0);

            // after role name updated
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
            expect(updatedUsers).toHaveLength(0);

            // after role added to user
            expect(addedUserRoleName).toEqual(updatedName);
            expect(addedUserRoleUsers).toHaveLength(1);
            expect(addedUserRoleUsers).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: _user
                    })
                ])
            );
        });
    });

    it('should create and remove new a role', async () => {
        await dbCleaner(async () => {
            const _name = randomStringGenerator();

            const rolesBeforeCreated = await RoleService.getRoles('');
            const rolesBeforeCreatedLength = rolesBeforeCreated.length;

            await RoleService.createRole({ name: _name });

            const rolesAfterCreated = await RoleService.getRoles('');
            const rolesAfterCreatedLength = rolesAfterCreated.length;

            await RoleService.removeRole(_name);

            const rolesAfterDeleted = await RoleService.getRoles('');
            const rolesAfterDeletedLength = rolesAfterDeleted.length;

            // after role created
            expect(rolesAfterCreatedLength).toEqual(
                rolesBeforeCreatedLength + 1
            );

            // after role removed
            expect(rolesAfterDeletedLength).toEqual(rolesBeforeCreatedLength);
        });
    });

    it('should return same role if no update params passed', async () => {
        await dbCleaner(async () => {
            const _name = 'ADMIN';

            const originalRole = await RoleService.getRoleByName(_name);
            const updatedRole = await RoleService.updateRole(_name);

            expect(originalRole).toHaveProperty('name');
            expect(updatedRole).toHaveProperty('name');
            expect(originalRole).toMatchObject(updatedRole);
        });
    });

    it('should return collection of roles', async () => {
        const result = await RoleService.getRoles('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of roles for name query', async () => {
        const search = 'tes';

        const result = await RoleService.getRoles(search, {});

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: expect.stringMatching(/tes/gi)
                })
            ])
        );
    });

    it('should return collection of roles with paginated structure', async () => {
        const result = await RoleService.getRoles('', {}, ['name'], [], {
            enablePagination: true
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.objectContaining({
                page: 1,
                pageSize: expect.any(Number),
                resultsCount: expect.any(Number),
                totalResultsCount: expect.any(Number),
                pagesCount: expect.any(Number),
                data: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String)
                    })
                ])
            })
        );
    });
});
