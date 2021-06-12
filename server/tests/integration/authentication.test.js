const fetch = require('node-fetch');
const express = require('express');
const { gql } = require('apollo-server');
const request = require('supertest');
const { query } = require('../util/graphql-test-utilities');
const dbCleaner = require('../util/db-cleaner');
const setUpMockGithubServer = require('../util/mock-github-server');
const authRoutes = require('../../routes/auth');
const session = require('express-session');

let agent;
let mockGithubServer;

const followRedirects = async () => {
    const res1 = await agent.get('/api/auth/oauth');

    expect(res1.status).toBe(303);
    expect(res1.headers.location).toMatch(
        RegExp(`^${process.env.GITHUB_OAUTH_SERVER}`)
    );
    expect(res1.headers.location).toMatch(
        /\/login\/oauth\/authorize\?scope=[\w:%]+&client_id=\w+&state=[\w-]*$/
    );

    const res2 = await fetch(res1.headers.location, { redirect: 'manual' });

    expect(res2.status).toBe(302);
    expect(res2.headers.get('location')).toMatch(
        RegExp(`^${process.env.API_SERVER}`)
    );
    expect(res2.headers.get('location')).toMatch(
        /\/api\/auth\/authorize\?code=\w+&state=[\w-]*$/
    );

    const removeDomain = process.env.API_SERVER.length;
    const location3 = res2.headers.get('location').substr(removeDomain);
    const res3 = await agent.get(location3);

    return res3;
};

/* eslint-disable */
describe('authentication', () => {
    beforeAll(async () => {
        expressApp = express();
        expressApp.use(
            session({
                secret: 'test environment',
                resave: false,
                saveUninitialized: true
            })
        );
        expressApp.use('/api/auth', authRoutes);
        agent = request.agent(expressApp);
        mockGithubServer = await setUpMockGithubServer();
    });

    afterAll(async () => {
        await mockGithubServer.tearDown();
    });

    afterEach(async () => {
        await agent.post('/api/auth/signout');
    });

    it('handles Oauth to and from GitHub with preexisting user', async () => {
        await dbCleaner(async () => {
            // A1
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                githubTeams: [process.env.GITHUB_TEAM_ADMIN, 'Irrelevant Team']
            });

            // A2
            const res = await followRedirects();

            const data = await query(gql`
                query {
                    me {
                        username
                        roles
                    }
                }
            `);

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
                githubTeams: [process.env.GITHUB_TEAM_ADMIN]
            });

            // A2
            const res = await followRedirects();

            const data = await query(gql`
                query {
                    me {
                        username
                        roles
                    }
                }
            `);

            // A3
            expect(res.status).toBe(303);
            expect(res.headers.location).toBe(
                `${process.env.APP_SERVER}/test-queue`
            );
            expect(data.me.username).toBe(_unknownUsername);
            expect(data.me.roles.sort()).toEqual(['ADMIN', 'TESTER'].sort());
        });
    });

    it('shows signup instructions when not on required teams', async () => {
        await dbCleaner(async () => {
            // A1
            const _unknownUsername = 'aurelia-proudfeet';
            mockGithubServer.nextLogin({
                githubUsername: _unknownUsername,
                githubTeams: []
            });

            // A2
            const response = await fetch(
                `${process.env.API_SERVER}/api/auth/oauth`,
                { redirect: 'follow' }
            );

            const data = await query(gql`
                query {
                    me {
                        username
                        roles
                    }
                }
            `);

            // A3
            expect(response.redirected).toBe(true);
            expect(response.url).toBe(
                `${process.env.APP_SERVER}/signup-instructions`
            );
            expect(data.me).toBe(null);
        });
    });

    it.only('supports signing out', async () => {
        await dbCleaner(async () => {
            // A1
            const _knownUsername = 'esmeralda-baggins';
            mockGithubServer.nextLogin({
                githubUsername: _knownUsername,
                githubTeams: [process.env.GITHUB_TEAM_ADMIN]
            });

            // A2
            await followRedirects();

            const first = await query(gql`
                query {
                    me {
                        username
                    }
                }
            `);

            const signoutResponse = await agent.post('/api/auth/signout');

            const second = await query(gql`
                query {
                    me {
                        username
                    }
                }
            `);

            // A3
            expect(first.me.username).toBe(_knownUsername);
            expect(signoutResponse.status).toBe(200);
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
                githubTeams: [process.env.GITHUB_TEAM_ADMIN]
            });

            // A2
            await fetch(
                `${process.env.API_SERVER}/api/auth/oauth` +
                    `?dataFromFrontend=${_dataFromFrontend}`,
                { redirect: 'follow' }
            );

            const firstLogin = await query(gql`
                query {
                    me {
                        roles
                    }
                }
            `);

            await fetch(`${process.env.API_SERVER}/api/auth/signout`, {
                method: 'POST'
            });

            await fetch(`${process.env.API_SERVER}/api/auth/oauth`, {
                redirect: 'follow'
            });

            const secondLogin = await query(gql`
                query {
                    me {
                        roles
                    }
                }
            `);

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
                githubTeams: [process.env.GITHUB_TEAM_ADMIN]
            });

            // A2
            const response = await fetch(
                `${process.env.API_SERVER}/api/auth/oauth` +
                    `?dataFromFrontend=${_dataFromFrontend}`,
                { redirect: 'follow' }
            );

            // A3
            expect(response.redirected).toBe(true);
            expect(response.url).toBe(
                `${process.env.APP_SERVER}/signup-instructions`
            );
        });
    });
});
