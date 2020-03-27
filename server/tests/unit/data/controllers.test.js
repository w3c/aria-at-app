const UsersController = require('../../../data/controllers/usersController');
const httpMocks = require('node-mocks-http');

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = null;
});

const newUser = require('../../mock-data/newUser.json');
const newUserToRole = require('../../mock-data/newUserToRole.json');
jest.mock('../../../data/services/usersService');
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
