const { ApolloServer } = require('apollo-server-express');
const {
    ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');
const graphqlSchema = require('./graphql-schema');
const getGraphQLContext = require('./graphql-context');
const resolvers = require('./resolvers');

const apolloServer = new ApolloServer({
    typeDefs: graphqlSchema,
    context: getGraphQLContext,
    resolvers,
    // The newer IDE does not work because of CORS issues
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});

module.exports = apolloServer;
