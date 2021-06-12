const getSessionAgent = require('supertest-session');
const bodyParser = require('body-parser');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const session = require('express-session');
const typeDefs = require('../../graphql-schema');
const getGraphQLContext = require('../../graphql-context');
const resolvers = require('../../resolvers');

const startSupertestServer = async ({ graphql = false, pathToRoutes = [] }) => {
    const expressApp = express();

    expressApp.use(bodyParser.json());
    expressApp.use(
        session({
            secret: 'test environment',
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
        })
    );

    let apolloServer;
    if (graphql) {
        apolloServer = new ApolloServer({
            typeDefs,
            context: getGraphQLContext,
            resolvers
        });

        await apolloServer.start();
        apolloServer.applyMiddleware({ app: expressApp, path: '/api/graphql' });
    }

    pathToRoutes.forEach(([path, routes]) => {
        expressApp.use(path, routes);
    });

    const sessionAgent = getSessionAgent(expressApp);

    const tearDown = async () => {
        if (graphql) {
            await apolloServer.stop();
        }
    };

    return { sessionAgent, tearDown };
};

module.exports = startSupertestServer;
