const fetch = require('node-fetch');
const setUpMockGithubServer = require('../util/mock-github-server');
const startSupertestServer = require('../util/api-server');
const authRoutes = require('../../routes/auth');
const db = require('../../models/index');

let sessionAgent;
let apiServer;
let mockGithubServer;

const followRedirects = async (firstUrl, { transaction }) => {
    const res1 = await sessionAgent
        .get(firstUrl)
        .set('x-transaction-id', transaction.id);

    expect(res1.status).toBe(303);
    expect(res1.headers.location).toMatch(
        RegExp(`^${process.env.GITHUB_OAUTH_SERVER}`)
    );
    expect(res1.headers.location).toMatch(
        /\/login\/oauth\/authorize\?scope=[\w:%]+&client_id=\w+$/
    );

    const res2 = await fetch(res1.headers.location, { redirect: 'manual' });

    expect(res2.status).toBe(302);
    expect(res2.headers.get('location')).toMatch(
        RegExp(`^${process.env.API_SERVER}`)
    );
    expect(res2.headers.get('location')).toMatch(
        /\/api\/auth\/authorize\?code=\w+$/
    );

    const removeDomain = process.env.API_SERVER.length;
    const location3 = res2.headers.get('location').substr(removeDomain);
    const res3 = await sessionAgent
        .get(location3)
        .set('x-transaction-id', transaction.id);

    return res3;
};

beforeAll(async () => {
    apiServer = await startSupertestServer({
        graphql: true,
        pathToRoutes: [['/api/auth', authRoutes]]
    });
    sessionAgent = apiServer.sessionAgent;
    mockGithubServer = await setUpMockGithubServer();
});

afterAll(async () => {
    await apiServer.tearDown();
    await mockGithubServer.tearDown();
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

afterEach(async () => {
    await sessionAgent.post('/api/auth/signout');
});

const knownAdmin = 'mcking65';

describe('authentication', () => {
    it('handles Oauth to and from GitHub with preexisting user', async () => {
        await apiServer.sessionAgentDbCleaner(async transaction => {
            // A1
            mockGithubServer.nextLogin({
                githubUsername: knownAdmin
            });

            // A2
            const res = await followRedirects('/api/auth/oauth', {
                transaction
            });

            const {
                body: { data }
            } = await sessionAgent
                .post('/api/graphql')
                .set('x-transaction-id', transaction.id)
                .send({
                    query: `
                        query {
                            me {
                                username
                                roles
                            }
                        }
                    `
                });

            // A3
            expect(res.status).toBe(303);
            expect(res.headers.location).toBe(
                `${process.env.APP_SERVER}/test-queue`
            );
            expect(data.me.username).toBe(knownAdmin);
            expect(data.me.roles.sort()).toEqual(
                ['ADMIN', 'TESTER', 'VENDOR'].sort()
            );
        });
    });

    it('signs in as a tester', async () => {
        await apiServer.sessionAgentDbCleaner(async transaction => {
            // A1
            const _testerUsername = 'a11ydoer'; // From testers.txt
            mockGithubServer.nextLogin({
                githubUsername: _testerUsername
            });

            // A2
            const res = await followRedirects('/api/auth/oauth', {
                transaction
            });

            const {
                body: { data }
            } = await sessionAgent
                .post('/api/graphql')
                .set('x-transaction-id', transaction.id)
                .send({
                    query: `
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
                });

            // A3
            expect(res.status).toBe(303);
            expect(res.headers.location).toBe(
                `${process.env.APP_SERVER}/test-queue`
            );
            expect(data.me.username).toBe(_testerUsername);
            expect(data.me.roles).toEqual(['TESTER']);
        });
    });

    it('shows signup instructions when not known to the system', async () => {
        await apiServer.sessionAgentDbCleaner(async transaction => {
            // A1
            const _unknownUsername = 'aurelia-proudfeet';
            mockGithubServer.nextLogin({
                githubUsername: _unknownUsername
            });

            // A2
            const res = await followRedirects('/api/auth/oauth', {
                transaction
            });

            const {
                body: { data }
            } = await sessionAgent
                .post('/api/graphql')
                .set('x-transaction-id', transaction.id)
                .send({
                    query: `
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
                });

            // A3
            expect(res.status).toBe(303);
            expect(res.headers.location).toBe(
                `${process.env.APP_SERVER}/signup-instructions`
            );
            expect(data.me).toBe(null);
        });
    });

    it('supports signing out', async () => {
        await apiServer.sessionAgentDbCleaner(async transaction => {
            // A1
            mockGithubServer.nextLogin({
                githubUsername: knownAdmin
            });

            // A2
            await followRedirects('/api/auth/oauth', { transaction });

            const {
                body: { data: first }
            } = await sessionAgent
                .post('/api/graphql')
                .set('x-transaction-id', transaction.id)
                .send({
                    query: `
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
                });

            const signoutRes = await sessionAgent
                .post('/api/auth/signout')
                .set('x-transaction-id', transaction.id);

            const {
                body: { data: second }
            } = await sessionAgent
                .post('/api/graphql')
                .set('x-transaction-id', transaction.id)
                .send({
                    query: `
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
                });

            // A3
            expect(first.me.username).toBe(knownAdmin);
            expect(signoutRes.status).toBe(200);
            expect(second.me).toBe(null);
        });
    });
});
