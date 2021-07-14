const express = require('express');
const randomStringGenerator = require('./random-character-generator');
const { ApolloServer, gql } = require('apollo-server-express');

const { GITHUB_TEAM_ADMIN } = process.env;

const setUpMockGithubServer = async () => {
    let nextGithubUsername;
    let nextIsOnAdminTeam;

    const typeDefs = gql`
        type Node {
            name: String
        }

        type Edge {
            node: Node
        }

        type Connection {
            edges: [Edge]
        }

        type Viewer {
            login: String
        }

        type Organization {
            teams(userLogins: String, query: String, first: Int): Connection
        }

        type Query {
            viewer: Viewer
            organization(login: String): Organization
        }
    `;

    const resolvers = {
        Query: {
            viewer: () => {
                return { login: nextGithubUsername };
            },
            organization: () => {
                return {};
            }
        },
        Organization: {
            teams: () => {
                const teamName = nextIsOnAdminTeam ? GITHUB_TEAM_ADMIN : null;
                return { edges: [{ node: { name: teamName } }] };
            }
        }
    };

    const apolloServer = new ApolloServer({ typeDefs, resolvers });

    const expressApp = express();

    await apolloServer.start();
    apolloServer.applyMiddleware({ app: expressApp });

    expressApp.get('/login/oauth/authorize', (req, res) => {
        const code = randomStringGenerator();
        const { state } = req.query;
        res.status(303).redirect(
            `${process.env.API_SERVER}/api/auth/authorize` +
                `?code=${code}&state=${state}`
        );
    });

    expressApp.post('/login/oauth/access_token', (req, res) => {
        const accessToken = randomStringGenerator();
        res.header('access-control-allow-origin', '*').send({
            access_token: accessToken
        });
    });

    let listener;
    await new Promise(resolve => {
        listener = expressApp.listen('4466', resolve);
    });

    const nextLogin = ({ githubUsername, isOnAdminTeam }) => {
        nextGithubUsername = githubUsername;
        nextIsOnAdminTeam = isOnAdminTeam;
    };

    const tearDown = async () => {
        listener.close();
        await apolloServer.stop();
    };

    return {
        nextLogin,
        tearDown
    };
};

module.exports = setUpMockGithubServer;
