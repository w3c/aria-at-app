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
const listOfATNames = require('../mock-data/listOfATs.json');
jest.mock('../../models/UsersModel');

describe('UsersService', () => {
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
    describe('UsersService.signupUser', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

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
            expect(userSaved).toBe(true);
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
});

jest.mock('../../models/ATModel');
describe('ATService', () => {
    describe('ATService.getATNames', () => {
        it('should have a getATNames function', () => {
            expect(typeof ATService.getATNames).toBe('function');
        });
        it('should return a list of AT names', async () => {
            const expected = listOfATNames.atNames;
            await expect(ATService.getATNames()).resolves.toEqual(expected);
        });
    });
});
