const UsersController = require('../../controllers/UsersController');
const AuthController = require('../../controllers/AuthController');
const ATController = require('../../controllers/ATController');
const UsersService = require('../../services/UsersService');
const TestController = require('../../controllers/TestController');
const httpMocks = require('node-mocks-http');

const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');
const listOfATNames = require('../mock-data/listOfATs.json');
jest.mock('../../services/UsersService');

const OAUTH = 'oauth';

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    req.session = {};
    res = httpMocks.createResponse();
    next = null;
});
afterEach(() => {
    UsersService.getUserAndUpdateRoles.mockClear();
});

describe('UsersController', () => {
    describe('UsersController.addUser', () => {
        beforeEach(() => {
            req.body = newUser;
        });

        it('should have a addUser function', () => {
            expect(typeof UsersController.addUser).toBe('function');
        });
        it('should return 201 response code', async () => {
            await UsersController.addUser(req, res, next);
            expect(res.statusCode).toBe(201);
            expect(res._isEndCalled()).toBeTruthy();
        });
        it('should return json body in response', async () => {
            await UsersController.addUser(req, res, next);
            expect(res._getJSONData()).toStrictEqual(newUser);
        });
    });

    describe('UsersController.addUserToRole', () => {
        beforeEach(() => {
            req.body = newUserToRole;
        });

        it('should have a addUserToRole function', () => {
            expect(typeof UsersController.addUserToRole).toBe('function');
        });
        it('should return 201 response code', async () => {
            await UsersController.addUserToRole(req, res, next);
            expect(res.statusCode).toBe(201);
            expect(res._isEndCalled()).toBeTruthy();
        });
        it('should return json body in response', async () => {
            await UsersController.addUserToRole(req, res, next);
            expect(res._getJSONData()).toStrictEqual(newUserToRole);
        });
    });
});

jest.mock('../../services/GithubService');
describe('AuthController', () => {
    let req;
    beforeEach(() => {
        req = httpMocks.createRequest({
            query: {
                referer: 'localhost:5000',
                service: 'github',
                code: '1345908724adsf32'
            }
        });
        req.session = {
            destroy: callback => {
                callback();
            },
            referer: 'localhost:5000'
        };
    });
    describe('AuthController.oauth', () => {
        it('should have a oauth function', () => {
            expect(typeof AuthController.oauth).toBe('function');
        });
        it('should return 303 response code', async () => {
            await AuthController.oauth(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
        });
    });
    describe('AuthController.authorize', () => {
        it('should have an authorize function', () => {
            expect(typeof AuthController.authorize).toBe('function');
        });
        it('should return 303 response code to sign up instructions when there is no authorize type', async () => {
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
            expect(res._getRedirectUrl()).toBe(
                'localhost:5000/signupInstructions'
            );
        });
        it('should return 303 response code to referer on sign up auth type', async () => {
            req.session.authType = OAUTH;
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
            expect(res._getRedirectUrl()).toBe('localhost:5000');
        });
        it('should provide a user with updated roles assigned on sign in', async () => {
            req.session.authType = OAUTH;
            await AuthController.authorize(req, res, next);
            expect(UsersService.getUserAndUpdateRoles.mock.results.length).toBe(
                1
            );
        });
    });
    describe('AuthController.currentUser', () => {
        it('should have an currentUser function', () => {
            expect(typeof AuthController.currentUser).toBe('function');
        });
        it('should return 401 response code if there is no user in the session', async () => {
            await AuthController.currentUser(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res._isEndCalled()).toBeTruthy();
        });
        it('should return 200 response code with user in the session', async () => {
            const user = { name: 'Foo Bar', username: 'foobar' };
            req.session.user = user;
            await AuthController.currentUser(req, res, next);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toStrictEqual(user);
        });
    });
    describe('AuthController.signout', () => {
        it('should have an signout function', () => {
            expect(typeof AuthController.signout).toBe('function');
        });
        it('should return destroy the session and return 200 response code', async () => {
            await AuthController.signout(req, res, next);
            expect(res.statusCode).toBe(200);
            expect(res._isEndCalled()).toBeTruthy();
        });
    });
});

jest.mock('../../services/ATService');
describe('ATController', () => {
    describe('ATController.getATs', () => {
        it('should have a getATs function', () => {
            expect(typeof ATController.getATs).toBe('function');
        });
        it('should return 200 response code with a list of ATs', async () => {
            await ATController.getATs(req, res, next);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toStrictEqual(listOfATNames.atsDB);
        });
    });
});

describe('TestController', () => {
    beforeEach(() => {
        req.body = { gitHash: 1234 };
    });
    it('should have an importTests function', () => {
        expect(typeof TestController.importTests).toBe('function');
    });

    it('should return 200 response with an object', () => {
        TestController.importTests(req, res);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({ gitHash: 1234 });
    })
});
