const request = require('supertest');
const { app, listener } = require('../../app');

const endpointUrl = '/api';

const userEndpoint = `${endpointUrl}/user`;
const authEndpoint = `${endpointUrl}/auth`;
const atEndpoint = `${endpointUrl}/at`;
const testEndpoint = `${endpointUrl}/test`;
const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');

const { dbCleaner } = require('../util/db-cleaner');
const db = require('../../models/index');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

// mocking the middleware used by the express app
const { session } = require('../../middleware/session.js');
jest.mock('../../middleware/session.js', () => ({
    session: jest.fn()
}));
describe('session middleware tests', () => {
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
        session.mockImplementation((req, res, next) => {
            req.session = {};
            next();
        });
        const response = await agent.get('/');
        expect(response.status).toBe(404);
        expect(session).toHaveBeenCalledTimes(1);
    });

    describe('sign in with session', () => {
        it(`GET ${authEndpoint}/me unauthorized`, async () => {
            session.mockImplementation((req, res, next) => {
                req.session = {};
                next();
            });
            const response = await agent.get('/auth/me');
            expect(response.status).toBe(401);
        });

        it(`GET ${authEndpoint}/me authorized`, async () => {
            session.mockImplementation((req, res, next) => {
                req.session = { user: { username: 'foobar', name: 'Foo Bar' } };
                next();
            });
            const response = await agent.get('/auth/me');
            expect(response.status).toBe(200);
        });
    });
    describe('sign out with existing session', () => {
        it(`POST ${authEndpoint}/signout`, async () => {
            session.mockImplementation((req, res, next) => {
                req.session = {
                    destroy(cb) {
                        cb();
                    }
                };
                next();
            });
            const response = await agent.post('/auth/signout');
            expect(response.status).toBe(200);
        });
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
    it(`GET ${userEndpoint}/`, async () => {
        const response = await request(listener).get(`${userEndpoint}/`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy();
    });
    it(`POST ${userEndpoint}/ats`, async () => {
        const response = await request(listener)
            .post(`${userEndpoint}/ats`)
            .send({
                user: {
                    id: 1,
                    username: 'foobar'
                },
                ats: [
                    {
                        at_name_id: 1,
                        active: false
                    },
                    {
                        at_name_id: 2,
                        active: true
                    }
                ]
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy();
    });
});

jest.mock('../../routes/auth');
describe(authEndpoint, () => {
    it(`GET ${authEndpoint}/oauth`, async () => {
        const response = await request(listener).get(`${authEndpoint}/oauth`);
        expect(response.statusCode).toBe(303);
    });
    it(`GET ${authEndpoint}/authorize`, async () => {
        const response = await request(listener).get(
            `${authEndpoint}/authorize?code=12345&service=github`
        );
        expect(response.statusCode).toBe(303);
    });
});

describe(atEndpoint, () => {
    it(`GET ${atEndpoint}`, async () => {
        await dbCleaner(async () => {
            const testVersion = await db.TestVersion.create();
            const atName = await db.AtName.create({ name: 'at' });
            await db.AtVersion.create({
                at_name_id: atName.id,
                version: '1'
            });

            await db.At.create({
                at_name_id: atName.id,
                test_version_id: testVersion.id,
                key: 'at'
            });

            const response = await request(listener).get(`${atEndpoint}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([
                {
                    id: atName.id,
                    name: 'at'
                }
            ]);
        });
    });
});

describe(`${testEndpoint}/import`, () => {
    it(`POST ${testEndpoint}/import`, async () => {
        await dbCleaner(async () => {
            await db.TestVersion.create({
                git_hash: '1234'
            });
            const response = await request(listener)
                .post(`${testEndpoint}/import`)
                .send({ git_hash: '1234' });
            expect(response.statusCode).toBe(200);
        });
    });
});
