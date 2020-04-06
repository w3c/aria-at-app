const moxios = require('moxios');
const UsersService = require('../../services/UsersService');
const GithubService = require('../../services/GithubService');

const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');
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
});
