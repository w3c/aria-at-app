const { pick } = require('lodash');
const { sequelize } = require('../../../models');
const UserService = require('../../../models/services/UserService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

describe('UserModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid user for id query with all associations', async () => {
        const _id = 1;

        const user = await UserService.getUserById(_id);
        const { id, username, createdAt, updatedAt } = user;

        expect(id).toEqual(_id);
        expect(username).toEqual('esmeralda-baggins');
        expect(createdAt).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(user).toHaveProperty('roles');
        expect(user).toHaveProperty('testPlanRuns');
    });

    it('should return valid user for id query with no associations', async () => {
        const _id = 1;

        const user = await UserService.getUserById(_id, null, [], [], []);
        const { id, username, createdAt, updatedAt } = user;

        expect(id).toEqual(_id);
        expect(username).toEqual('esmeralda-baggins');
        expect(createdAt).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(user).not.toHaveProperty('roles');
        expect(user).not.toHaveProperty('testPlanRuns');
    });

    it('should return valid user for username query', async () => {
        const _id = 1;
        const _username = 'esmeralda-baggins';

        const user = await UserService.getUserByUsername(_username);
        const { id, username, createdAt, updatedAt } = user;

        expect(id).toEqual(_id);
        expect(username).toEqual(_username);
        expect(createdAt).toBeTruthy();
        expect(updatedAt).toBeTruthy();
    });

    it('should not be valid user query', async () => {
        const _id = 53935;

        const user = await UserService.getUserById(_id);
        expect(user).toBeNull();
    });

    it('should contain valid user with roles array', async () => {
        const _id = 1;

        const user = await UserService.getUserById(_id);
        const { roles } = user;

        expect(user).toHaveProperty('roles');
        expect(roles).toBeInstanceOf(Array);
        expect(roles.length).toBeGreaterThanOrEqual(1);
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'ADMIN' })
        );
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'TESTER' })
        );
    });

    it('should contain valid user with testPlanRuns array', async () => {
        const _id = 1;

        const user = await UserService.getUserById(_id);

        const { testPlanRuns } = user;

        expect(user).toHaveProperty('testPlanRuns');
        expect(testPlanRuns.length).toBeGreaterThanOrEqual(0);
        expect(testPlanRuns).toContainEqual(expect.objectContaining({ id: 1 }));
    });

    it('should create, add role to, remove role from and remove a new user', async () => {
        await dbCleaner(async () => {
            // A1
            const _username = randomStringGenerator();
            const _role1 = 'ADMIN';
            const _role2 = 'TESTER';

            // A2
            const [newUser, isNew1] = await UserService.getOrCreateUser(
                { username: _username },
                { roles: [{ name: _role1 }] }
            );
            const { id, username, createdAt, updatedAt, roles } = newUser;

            // A2
            const [updatedUser, isNew2] = await UserService.getOrCreateUser(
                { username: _username },
                { roles: [{ name: _role2 }] }
            );

            // A2
            await UserService.removeUser(id);
            const deletedUser = await UserService.getUserById(id);

            // after user created and role added
            expect(isNew1).toBe(true);
            expect(id).toBeTruthy();
            expect(username).toEqual(_username);
            expect(createdAt).toBeTruthy();
            expect(updatedAt).toBeTruthy();
            expect(roles).toHaveLength(1);
            expect(roles[0].name).toEqual('ADMIN');

            // after role removed
            expect(isNew2).toBe(false);
            expect(updatedUser.roles[0].name).toBe('TESTER');

            // after user removed
            expect(deletedUser).toBeNull();
        });
    });

    it('should create and update a new user', async () => {
        await dbCleaner(async () => {
            // A1
            const _username = randomStringGenerator();
            const _updatedUsername = randomStringGenerator();

            // A2
            const user = await UserService.createUser({ username: _username });
            const { id, username, createdAt, updatedAt } = user;

            // A2
            const updatedUser = await UserService.updateUser(id, {
                username: _updatedUsername
            });
            const updatedUsername = updatedUser.get('username');

            // after user created
            expect(id).toBeTruthy();
            expect(username).toEqual(_username);
            expect(createdAt).toBeTruthy();
            expect(updatedAt).toBeTruthy();

            // after user updated
            expect(_username).not.toEqual(_updatedUsername);
            expect(username).not.toEqual(updatedUsername);
            expect(updatedUsername).toEqual(_updatedUsername);
        });
    });

    it('should return collection of users', async () => {
        const result = await UserService.getUsers('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of users for username query', async () => {
        const search = 't';

        const result = await UserService.getUsers(search, {});

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    username: expect.stringMatching(/t/gi)
                })
            ])
        );
    });

    it('should return collection of users with paginated structure', async () => {
        const result = await UserService.getUsers('', {}, ['id'], [], [], [], {
            page: -1,
            limit: -1,
            enablePagination: true
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.objectContaining({
                page: 1,
                pageSize: null,
                resultsCount: expect.any(Number),
                totalResultsCount: expect.any(Number),
                pagesCount: expect.any(Number),
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number)
                    })
                ])
            })
        );
    });

    it('should bulkGetOrReplace UserRoles', async () => {
        await dbCleaner(async () => {
            // A1
            const adminUserId = 1;

            // A2
            const [
                originalUserRoles,
                isUpdated1
            ] = await UserService.bulkGetOrReplaceUserRoles(
                { userId: adminUserId },
                [{ roleName: 'TESTER' }, { roleName: 'ADMIN' }],
                ['roleName']
            );

            const [
                updatedUserRoles,
                isUpdated2
            ] = await UserService.bulkGetOrReplaceUserRoles(
                { userId: adminUserId },
                [{ roleName: 'TESTER' }],
                ['roleName']
            );

            // A3
            expect(isUpdated1).toBe(false);
            expect(originalUserRoles.length).toBe(2);
            expect(
                originalUserRoles.map(each => pick(each, ['roleName']))
            ).toEqual([{ roleName: 'ADMIN' }, { roleName: 'TESTER' }]);

            expect(isUpdated2).toBe(true);
            expect(updatedUserRoles.length).toBe(1);
            expect(
                updatedUserRoles.map(each => pick(each, ['roleName']))
            ).toEqual([{ roleName: 'TESTER' }]);
        });
    });
});
