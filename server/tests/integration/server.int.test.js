const request = require('supertest');
const { app, listener } = require('../../app');

const endpointUrl = '/api';

const userEndpoint = `${endpointUrl}/user`;
const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');

// mocking the middleware used by the express app
const session = require('../../middleware/session.js');
jest.mock('../../middleware/session.js', () =>
    jest.fn((req, res, next) => next())
);
describe('session middleware', () => {
    // setup and teardown of a listener to test the middleware
    const supertest = require('supertest');
    let server, agent;
    beforeEach(done => {
        server = app.listen(4000, err => {
            if (err) return done(err);

            agent = supertest(server);
            done();
        });
    });

    afterEach(done => {
        server && server.close(done);
    });

    it('uses session middleware', async () => {
        const response = await agent.get('/');
        expect(response.status).toBe(404);
        expect(session).toHaveBeenCalledTimes(1);
    });
});

jest.mock('../../routes/users');
describe(userEndpoint, () => {
    it(`POST ${userEndpoint}`, async () => {
        const response = await request(listener)
            .post(userEndpoint)
            .send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body).toBeTruthy();
    });
    it(`POST ${userEndpoint}/role`, async () => {
        const response = await request(listener)
            .post(`${userEndpoint}/role`)
            .send(newUserToRole);
        expect(response.statusCode).toBe(201);
        expect(response.body).toBeTruthy();
    });
});
