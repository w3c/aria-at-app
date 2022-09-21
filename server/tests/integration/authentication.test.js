const fetch = require('node-fetch');
const dbCleaner = require('../util/db-cleaner');
const setUpMockGithubServer = require('../util/mock-github-server');
const startSupertestServer = require('../util/api-server');
const authRoutes = require('../../routes/auth');
const db = require('../../models/index');

let sessionAgent;
let apiServer;
let mockGithubServer;

const followRedirects = async firstUrl => {
    const res1 = await sessionAgent.get(firstUrl);

    expect(res1.status).toBe(303);
    expect(res1.headers.location).toMatch(
        RegExp(`^${process.env.GITHUB_OAUTH_SERVER}`)
    );
    expect(res1.headers.location).toMatch(
        /\/login\/oauth\/authorize\?scope=[\w:%]+&client_id=\w+&state=[%\w-]*$/
    );

    const res2 = await fetch(res1.headers.location, { redirect: 'manual' });

    expect(res2.status).toBe(302);
    expect(res2.headers.get('location')).toMatch(
        RegExp(`^${process.env.API_SERVER}`)
    );
    expect(res2.headers.get('location')).toMatch(
        /\/api\/auth\/authorize\?code=\w+&state=[%\w-]*$/
    );

    const removeDomain = process.env.API_SERVER.length;
    const location3 = res2.headers.get('location').substr(removeDomain);
    const res3 = await sessionAgent.get(location3);

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

describe('authentication', () => {
    it('handles Oauth to and from GitHub with preexisting user', async () => {
        await dbCleaner(async () => {
            // A1
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                isOnAdminTeam: true
            });

            // A2
            const res = await followRedirects('/api/auth/oauth');

            const {
                body: { data }
            } = await sessionAgent.post('/api/graphql').send({
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
            expect(data.me.username).toBe(_knownUsername);
            expect(data.me.roles.sort()).toEqual(['ADMIN', 'TESTER'].sort());
        });
    });

    it('handles Oauth redirection from GitHub with unknown user', async () => {
        await dbCleaner(async () => {
            // A1
            const _unknownUsername = 'aurelia-proudfeet';
            mockGithubServer.nextLogin({
                githubUsername: _unknownUsername,
                isOnAdminTeam: true
            });

            // A2
            const res = await followRedirects('/api/auth/oauth');

            const {
                body: { data }
            } = await sessionAgent.post('/api/graphql').send({
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
            expect(data.me.username).toBe(_unknownUsername);
            expect(data.me.roles.sort()).toEqual(['ADMIN', 'TESTER'].sort());
        });
    });

    it('signs in as a tester', async () => {
        await dbCleaner(async () => {
            // A1
            const _testerUsername = 'a11ydoer'; // From testers.txt
            mockGithubServer.nextLogin({
                githubUsername: _testerUsername,
                isOnAdminTeam: false
            });

            // A2
            const res = await followRedirects('/api/auth/oauth');

            const {
                body: { data }
            } = await sessionAgent.post('/api/graphql').send({
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
        await dbCleaner(async () => {
            // A1
            const _unknownUsername = 'aurelia-proudfeet';
            mockGithubServer.nextLogin({
                githubUsername: _unknownUsername,
                isOnAdminTeam: false
            });

            // A2
            const res = await followRedirects('/api/auth/oauth');

            const {
                body: { data }
            } = await sessionAgent.post('/api/graphql').send({
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
        await dbCleaner(async () => {
            // A1
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                isOnAdminTeam: true
            });

            // A2
            await followRedirects('/api/auth/oauth');

            const {
                body: { data: first }
            } = await sessionAgent.post('/api/graphql').send({
                query: `
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
            });

            const signoutRes = await sessionAgent.post('/api/auth/signout');

            const {
                body: { data: second }
            } = await sessionAgent.post('/api/graphql').send({
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
            expect(first.me.username).toBe(_knownUsername);
            expect(signoutRes.status).toBe(200);
            expect(second.me).toBe(null);
        });
    });

    it('allows fake roles to be applied for the duration of a session', async () => {
        await dbCleaner(async () => {
            // A1
            const _dataFromFrontend = 'fakeRole-tester';
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                isOnAdminTeam: true
            });

            // A2
            await followRedirects(
                `/api/auth/oauth?dataFromFrontend=${_dataFromFrontend}`
            );

            const {
                body: { data: firstLogin }
            } = await sessionAgent.post('/api/graphql').send({
                query: `
                    query {
                        me {
                            roles
                        }
                    }
                `
            });

            await sessionAgent.post('/api/auth/signout');

            await followRedirects(`/api/auth/oauth`);

            const {
                body: { data: secondLogin }
            } = await sessionAgent.post('/api/graphql').send({
                query: `
                    query {
                        me {
                            roles
                        }
                    }
                `
            });

            // A3
            expect(firstLogin.me.roles).toEqual(['TESTER']);
            expect(secondLogin.me.roles.sort()).toEqual(
                ['ADMIN', 'TESTER'].sort()
            );
        });
    });

    it('allows faking no teams', async () => {
        await dbCleaner(async () => {
            // A1
            const _dataFromFrontend = 'fakeRole-';
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                isOnAdminTeam: true
            });

            // A2
            const res = await followRedirects(
                `/api/auth/oauth?dataFromFrontend=${_dataFromFrontend}`
            );

            // A3
            expect(res.status).toBe(303);
            expect(res.headers.location).toBe(
                `${process.env.APP_SERVER}/signup-instructions`
            );
        });
    });
});
