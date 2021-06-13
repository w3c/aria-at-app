const express = require('express');
const randomStringGenerator = require('./random-character-generator');
const { ApolloServer, gql } = require('apollo-server-express');

const setUpMockGithubServer = async () => {
    let nextGithubUsername;
    let nextGithubTeams;

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
                return {
                    edges: nextGithubTeams.map(teamName => {
                        return { node: { name: teamName } };
                    })
                };
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

    const nextLogin = ({ githubUsername, githubTeams }) => {
        nextGithubUsername = githubUsername;
        nextGithubTeams = githubTeams;
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
