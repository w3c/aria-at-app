const getSessionAgent = require('supertest-session');
const bodyParser = require('body-parser');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const session = require('express-session');
const typeDefs = require('../../graphql-schema');
const getGraphQLContext = require('../../graphql-context');
const resolvers = require('../../resolvers');
const transactionMiddleware = require('../../middleware/transactionMiddleware');
const { sequelize } = require('../../models');

const startSupertestServer = async ({
    graphql = false,
    applyMiddleware,
    applyErrorware,
    pathToRoutes = []
}) => {
    const expressApp = express();

    expressApp.use(bodyParser.json());
    expressApp.use(
        session({
            secret: 'test environment',
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 500000 } // Required
        })
    );
    expressApp.use(transactionMiddleware.middleware);
    if (applyMiddleware) applyMiddleware(expressApp);

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

    expressApp.use(transactionMiddleware.errorware);
    if (applyErrorware) applyErrorware(expressApp);

    // Error handling must be the last middleware
    expressApp.use((error, req, res, next) => {
        console.error(error);
        next(error);
    });

    const sessionAgent = getSessionAgent(expressApp);

    const sessionAgentDbCleaner = async callback => {
        const transaction = await sequelize.transaction();
        transactionMiddleware.forTestingPopulateTransaction(transaction);
        await callback(transaction);
        await transactionMiddleware.forTestingRollBackTransaction(
            transaction.id
        );
    };

    const tearDown = async () => {
        if (graphql) {
            await apolloServer.stop();
        }
    };

    return { sessionAgent, sessionAgentDbCleaner, tearDown };
};

module.exports = startSupertestServer;
