const UsersController = require('../../controllers/UsersController');
const AuthController = require('../../controllers/AuthController');
const ATController = require('../../controllers/ATController');
const httpMocks = require('node-mocks-http');

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    req.session = {};
    res = httpMocks.createResponse();
    next = null;
});

const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');
const listOfATNames = require('../mock-data/listOfATs.json');
jest.mock('../../services/UsersService');
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
        it('should return 303 response code to signup instructions when there is no authorize type', async () => {
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
            expect(res._getRedirectUrl()).toBe(
                'localhost:5000/signupInstructions'
            );
        });
        it('should return 303 response code to referer on signup auth type', async () => {
            req.session['authType'] = 'signup';
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
            expect(res._getRedirectUrl()).toBe('localhost:5000');
        });
        it('should return 303 response code to referer on login auth type', async () => {
            req.session['authType'] = 'login';
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
            expect(res._getRedirectUrl()).toBe('localhost:5000');
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
    describe('AuthController.logout', () => {
        it('should have an logout function', () => {
            expect(typeof AuthController.logout).toBe('function');
        });
        it('should return destroy the session and return 200 response code', async () => {
            await AuthController.logout(req, res, next);
            expect(res.statusCode).toBe(200);
            expect(res._isEndCalled()).toBeTruthy();
        });
    });
});

jest.mock('../../services/ATService');
describe('ATController', () => {
    describe('ATController.getATNames', () => {
        it('should have a getATNames function', () => {
            expect(typeof ATController.getATNames).toBe('function');
        });
        it('should return 200 response code with a list of ATs', async () => {
            await ATController.getATNames(req, res, next);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toStrictEqual(listOfATNames.atNames);
        });
    });
});
