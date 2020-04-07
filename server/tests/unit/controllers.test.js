const UsersController = require('../../controllers/UsersController');
const AuthController = require('../../controllers/AuthController');
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
                service: 'github'
            }
        });
        req.session = {};
    });
    describe('AuthController.login', () => {
        it('should have a login function', () => {
            expect(typeof AuthController.login).toBe('function');
        });
        it('should return 303 response code', async () => {
            await AuthController.login(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
        });
    });
    describe('AuthController.authorize', () => {
        it('should have an authorize function', () => {
            expect(typeof AuthController.authorize).toBe('function');
        });
        it('should return 303 response code', async () => {
            await AuthController.authorize(req, res, next);
            expect(res.statusCode).toBe(303);
            expect(res._isEndCalled()).toBeTruthy();
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
});
