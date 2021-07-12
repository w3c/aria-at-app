const ATController = require('../../controllers/ATController');
const TestController = require('../../controllers/TestController');
const httpMocks = require('node-mocks-http');

const listOfATNames = require('../mock-data/listOfATs.json');

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    req.session = {};
    res = httpMocks.createResponse();
    next = null;
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
