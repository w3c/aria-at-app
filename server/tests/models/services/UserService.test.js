const { sequelize } = require('../../../models');
const UserService = require('../../../models/services/UserService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

describe('UserModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid user for id query', async () => {
        const _id = 1;

        const user = await UserService.getUserById(_id);
        const { id, username, createdAt, updatedAt } = user;

        expect(id).toEqual(_id);
        expect(username).toEqual('foobar-admin');
        expect(createdAt).toBeTruthy();
        expect(updatedAt).toBeTruthy();
    });

    it('should return valid user for username query', async () => {
        const _id = 1;
        const _username = 'foobar-admin';

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
            expect.objectContaining({ name: 'admin' })
        );
        expect(roles).toContainEqual(
            expect.objectContaining({ name: 'tester' })
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
            const _role = 'admin';

            // A2
            const user = await UserService.createUser({
                username: _username,
                role: _role
            });
            const { id, username, createdAt, updatedAt, roles } = user;

            // A2
            await UserService.deleteUserFromRole(id, _role);
            const updatedUser = await UserService.getUserById(id);

            // A2
            await UserService.removeUser(id);
            const deletedUser = await UserService.getUserById(id);

            // after user created and role added
            expect(id).toBeTruthy();
            expect(username).toEqual(_username);
            expect(createdAt).toBeTruthy();
            expect(updatedAt).toBeTruthy();
            expect(roles).toHaveLength(1);

            // after role removed
            expect(updatedUser.roles).toHaveLength(0);

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
        const result = await UserService.getUsers('', {}, ['id'], [], [], {
            page: -1,
            limit: -1,
            enablePagination: true
        });
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
