const request = require('supertest');
const { app, listener } = require('../../app');

const endpointUrl = '/api';

const userEndpoint = `${endpointUrl}/user`;
const authEndpoint = `${endpointUrl}/auth`;
const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');

// mock the models to circumvent the actual database
jest.mock('../../models/UsersModel');

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

jest.mock('../../routes/auth');
describe(authEndpoint, () => {
    it(`GET ${authEndpoint}/login`, async () => {
        const response = await request(listener).get(`${authEndpoint}/login`);
        expect(response.statusCode).toBe(303);
    });
    it(`GET ${authEndpoint}/authorize`, async () => {
        const response = await request(listener).get(
            `${authEndpoint}/authorize?code=12345&service=github`
        );
        expect(response.statusCode).toBe(303);
    });
    it(`GET ${authEndpoint}/me`, async () => {
        const response = await request(listener).get(`${authEndpoint}/me`);
        expect(response.statusCode).toBe(200);
    });
});
