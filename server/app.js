const express = require('express');
const bodyParser = require('body-parser');
const cacheMiddleware = require('apicache').middleware;
const proxyMiddleware = require('rawgit/lib/middleware');
const { ApolloServer } = require('apollo-server-express');
const {
    ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');
const { session } = require('./middleware/session');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const path = require('path');
const graphqlSchema = require('./graphql-schema');
const getGraphQLContext = require('./graphql-context');
const resolvers = require('./resolvers');

const app = express();

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/test', testRoutes);

const server = new ApolloServer({
    typeDefs: graphqlSchema,
    context: getGraphQLContext,
    resolvers,
    // The newer IDE does not work because of CORS issues
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});
server.start().then(() => {
    server.applyMiddleware({ app });
});

const listener = express();
listener.use('/api', app);

const baseUrl = 'https://raw.githubusercontent.com';
const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/:branch/*').get(
    cacheMiddleware('7 days', onlyStatus200),
    (req, res, next) => {
        req.url = path.join('w3c', req.url);
        next();
    },
    proxyMiddleware.fileRedirect(baseUrl),
    proxyMiddleware.proxyPath(baseUrl)
);

// Error handling must be the last middleware
listener.use((error, req, res, next) => {
    console.error(error);
    next(error);
});

module.exports = { app, listener };
