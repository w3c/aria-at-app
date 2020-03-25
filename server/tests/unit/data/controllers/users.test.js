const UsersController = require('../../../../data/controllers/usersController');
const httpMocks = require('node-mocks-http');
const newUser = require('../../../mock-data/newUser.json');

jest.mock('../../../../data/services/usersService');

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = null;
});

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
