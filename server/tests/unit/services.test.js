process.env = {
    ...process.env,
    GITHUB_TEAM_TESTER: 'Team 1',
    GITHUB_TEAM_ADMIN: 'Team 2'
};
const moxios = require('moxios');
const UsersService = require('../../services/UsersService');
const GithubService = require('../../services/GithubService');
const ATService = require('../../services/ATService');
const TestService = require('../../services/TestService');

const { dbCleaner } = require('../util/db-cleaner');
const db = require('../../models/index');

const newUser = require('../mock-data/newUser.json');
const users = require('../mock-data/users.json');

describe('UsersService', () => {
    describe('UsersService.getUser', () => {
        it('should have a getUser function', () => {
            expect(typeof UsersService.getUser).toBe('function');
        });
        it('should return a user', async () => {
            await dbCleaner(async () => {
                let newUserRow = await db.Users.create(newUser);
                let newUserToRoleRows = (await db.Role.findAll()).map(role => {
                    return {
                        user_id: newUserRow.dataValues.id,
                        role_id: role.dataValues.id
                    }
                });
                await db.UserToRole.bulkCreate(newUserToRoleRows);

                await expect(UsersService.getUser({ ...newUser })).resolves.toEqual(
                    {
                        ...newUser,
                        id: newUserRow.dataValues.id,
                        roles: ['admin', 'tester']
                    }
                );
            });
        });
    });
    describe('UsersService.addUser', () => {
        it('should have a addUser function', () => {
            expect(typeof UsersService.addUser).toBe('function');
        });
        it('should return newUser', async () => {
            await dbCleaner(async () => {
                let returnedValue = await UsersService.addUser(newUser);

                // TODO: maybe all Services should return simple objects
                // instead of Sequalize objects.
                await expect(returnedValue.dataValues).toEqual(
                    {
                        ...newUser,
                        id: returnedValue.id
                    }
                );
            });
        });
    });

    describe('UsersService.addUserToRole', () => {
        it('should have a addUserToRole function', () => {
            expect(typeof UsersService.addUserToRole).toBe('function');
        });
        it('should return userToRole', async () => {
            await dbCleaner(async () => {
                let newUserRow = await db.Users.create(newUser);
                let role = await db.Role.findOne({
                    attributes: ['id'],
                    where: {
                        name: "tester"
                    }
                });
                let returnedValue = await UsersService.addUserToRole({
                    user_id: newUserRow.dataValues.id,
                    role_id: role.dataValues.id
                });

                // TODO: maybe all Services should return simple objects
                // instead of Sequalize objects.
                await expect(returnedValue.dataValues).toEqual({
                    user_id: newUserRow.dataValues.id,
                    role_id: role.dataValues.id,
                    id: returnedValue.dataValues.id
                });
            });
        });
    });
    describe('UsersService.getAllTesters', () => {
        it('should have a getAllTesters function', () => {
            expect(typeof UsersService.getAllTesters).toBe('function');
        });
        it('return a list of users', async () => {
            await dbCleaner(async () => {
                let addedUser = await UsersService.addUser(newUser);
                let returnedValue = await UsersService.getAllTesters();

                expect(returnedValue[0]).toEqual({
                    ...newUser,
                    id: addedUser.dataValues.id,
                    configured_ats: []
                });
            });
        });
    });
});

describe('GithubService', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    describe('GithubService.login', () => {
        it('should have a url attribute', () => {
            expect(typeof GithubService.url).toBe('string');
        });
    });
    describe('GithubService.authorize', () => {
        it('should have a authorize function', () => {
            expect(typeof GithubService.authorize).toBe('function');
        });
        it('should return a token', async () => {
            const code = '123456';
            const token = 'token12345';
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 200,
                    response: {
                        access_token: token
                    }
                });
            });
            const accessToken = await GithubService.authorize(code);

            await expect(accessToken).toBe(token);
        });
    });
    describe('GithubService.getUser', () => {
        it('should have a getUser function', () => {
            expect(typeof GithubService.getUser).toBe('function');
        });
        it('should fail where there is no accessToken option', async () => {
            await expect(GithubService.getUser()).rejects.toThrow();
        });
        it('should return', async () => {
            const options = { accessToken: '123456' };
            const responseObj = {
                data: {
                    viewer: {
                        login: 'evmiguel',
                        name: 'Erika Miguel'
                    }
                }
            };
            const userObj = {
                username: 'evmiguel',
                name: 'Erika Miguel'
            };
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 200,
                    response: responseObj
                });
            });

            const received = await GithubService.getUser(options);
            expect(received).toEqual(userObj);
        });
    });

    // Putting this test here because GitHub is part of the signup process
    describe('UsersService.signupUser', () => {
        it('should have a signupUser function', () => {
            expect(typeof UsersService.signupUser).toBe('function');
        });

        it('should save a user and role if the user is new', async () => {
            await dbCleaner(async () => {
                moxios.wait(() => {
                    const request = moxios.requests.mostRecent();
                    request.respondWith({
                        status: 200,
                        response: {
                            data: {
                                organization: {
                                    teams: {
                                        edges: [
                                            {
                                                node: {
                                                    name: 'Team 1'
                                                }
                                            },
                                            {
                                                node: {
                                                    name: 'Team 2'
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    });
                });
                const userSaved = await UsersService.signupUser(
                    {
                        user: { ...newUser, name: newUser.fullname }
                    }
                );

                expect(userSaved).toEqual({
                    email: 'foo@bar.com',
                    fullname: 'Foo Bar',
                    id: userSaved.id,
                    username: 'foobar'
                });
            });
        });
    });
});

describe('ATService', () => {
    describe('ATService.getATs', () => {
        it('should have a getATs function', () => {
            expect(typeof ATService.getATs).toBe('function');
        });
        it('should return a list of AT names', async () => {
            await dbCleaner(async () => {
                const expected = [
                    { name: "assitiveTech1" },
                    { name: "assitiveTech2" }
                ];
                const atName = await db.AtName.bulkCreate(expected);
                returnedAts = (await ATService.getATs()).map(at => ({name: at.dataValues.name}));
                expect(returnedAts).toEqual(expected);
            });
        });
    });
});

describe('TestService', () => {
    describe('TestService.importTests', () => {
        it('should have an importTests function', () => {
            expect(typeof TestService.importTests).toBe('function');
        });
        it('should return true when has exists', async () => {
            await dbCleaner(async () => {
                const testVersionHash = "1234abcd";
                await db.TestVersion.create({
                    git_hash: testVersionHash

                });
                await expect(await TestService.importTests(testVersionHash)).toEqual(true);
            });

        });
    });
});
