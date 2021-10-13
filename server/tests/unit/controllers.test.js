const httpMocks = require('node-mocks-http');
const TestController = require('../../controllers/TestController');

let req, res;
beforeEach(() => {
    req = httpMocks.createRequest();
    req.session = {};
    res = httpMocks.createResponse();
});

jest.mock('../../services/TestService');
describe('TestController', () => {
    beforeEach(() => {
        req.body = { git_hash: '1234' };
    });
    it('should have an importTests function', () => {
        expect(typeof TestController.importTests).toBe('function');
    });

    it('should return 200 response with an object', () => {
        TestController.importTests(req, res);
        expect(res.statusCode).toBe(200);
    });
});
