process.env = {
    ...process.env,
    GITHUB_TEAM_TESTER: 'Team 1',
    GITHUB_TEAM_ADMIN: 'Team 2'
};
const moxios = require('moxios');
const UsersService = require('../../services/UsersService');
const GithubService = require('../../services/GithubService');
const ATService = require('../../services/ATService');

const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');
const listOfATs = require('../mock-data/listOfATs.json');
const users = require('../mock-data/users.json');
jest.mock('../../models/UsersModel');

describe('UsersService', () => {
    describe('UsersService.getUser', () => {
        it('should have a getUser function', () => {
            expect(typeof UsersService.getUser).toBe('function');
        });
        it('should return a user', async () => {
            await expect(UsersService.getUser({ ...newUser })).resolves.toEqual(
                {
                    id: 1,
                    ...newUser,
                    roles: ['admin', 'tester']
                }
            );
        });
    });
    describe('UsersService.addUser', () => {
        it('should have a addUser function', () => {
            expect(typeof UsersService.addUser).toBe('function');
        });
        it('should return newUser', async () => {
            await expect(UsersService.addUser(newUser)).resolves.toEqual(
                newUser
            );
        });
    });
    describe('UsersService.addUserToRole', () => {
        it('should have a addUserToRole function', () => {
            expect(typeof UsersService.addUserToRole).toBe('function');
        });
        it('should return userToRole', async () => {
            await expect(
                UsersService.addUserToRole(newUserToRole)
            ).resolves.toEqual(newUserToRole);
        });
    });
    describe('UsersService.getAllTesters', () => {
        it('should have a getAllTesters function', () => {
            expect(typeof UsersService.getAllTesters).toBe('function');
        });
        it('return a list of users', async () => {
            const testers = await UsersService.getAllTesters();
            expect(testers[0]).toEqual({
                ...users[0],
                configured_ats: [
                    { active: true, at_name: 'Foo', at_name_id: 1 }
                ]
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
            const userSaved = await UsersService.signupUser({ user: newUser });
            expect(userSaved).toEqual({
                email: 'foo@bar.com',
                fullname: 'Foo Bar',
                id: 1,
                roles: ['admin', 'tester'],
                username: 'foobar'
            });
        });
    });
});

jest.mock('../../models/ATModel');
describe('ATService', () => {
    describe('ATService.getATs', () => {
        it('should have a getATs function', () => {
            expect(typeof ATService.getATs).toBe('function');
        });
        it('should return a list of AT names', async () => {
            const expected = listOfATs.atsDB;
            await expect(ATService.getATs()).resolves.toEqual(expected);
        });
    });
});
