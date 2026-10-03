const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} = require('apollo-server-core');
const graphqlSchema = require('./graphql-schema');
const getGraphQLContext = require('./graphql-context');
const resolvers = require('./resolvers');

const isDeployed = ['production', 'staging', 'sandbox'].includes(
  process.env.ENVIRONMENT
);

const apolloServer = new ApolloServer({
  typeDefs: graphqlSchema,
  context: getGraphQLContext,
  resolvers,
  introspection: !isDeployed,
  debug: !isDeployed,
  formatError: err => {
    if (isDeployed && err.extensions) {
      delete err.extensions.exception;
    }
    return err;
  },
  plugins: [
    isDeployed
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground()
  ]
});

module.exports = apolloServer;
