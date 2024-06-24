const { ApolloServer } = require('apollo-server');
const typeDefs = require('../../graphql-schema');
const getGraphQLContext = require('../../graphql-context');
const resolvers = require('../../resolvers');
const defaultUser = require('../mock-data/newUser.json');

let mockReq;

const server = new ApolloServer({
  typeDefs,
  context: () => getGraphQLContext({ req: mockReq }),
  resolvers
});

const failWithErrors = errors => {
  let formatted = '';
  errors.forEach(error => {
    if (error.originalError) {
      formatted += `${error.originalError.stack}\n\n`;
    }

    const formattedType = error.name ? `${error.name}: ` : '';
    const formattedPath = error.path
      ? ` in ${JSON.stringify(error.path)} `
      : '';
    let formattedException = '';
    if (error.extensions.exception) {
      formattedException = 'Exception content:\n\n';
      Object.entries(error.extensions.exception).forEach(([key, value]) => {
        formattedException += `${key}:\n${value}\n\n`;
      });
      delete error.extensions.exception;
    }
    formatted +=
      `GraphQL error${formattedPath}:\n\n` +
      `${formattedType}${error.message}\n\n` +
      `(${JSON.stringify({
        extensions: error.extensions,
        location: error.location
      })})\n\n` +
      formattedException;
  });
  throw new Error(formatted);
};

/**
 * Returns the data from a given query, useful for situations where errors are
 * not expected.
 * @param {GraphQLSyntaxTree} gql - GraphQL query from a gql template string.
 * @example gql`query { me { username } }`
 * @param {object} options
 * @param {object} options.user - Replace the default user or set it to null
 * to simulate being logged out.
 * @param {*} options.transaction - Sequelize transaction
 * @returns {any} Data matching the query.
 */
const query = async (
  gql,
  { transaction, user = defaultUser, ...queryOptions } = {}
) => {
  mockReq = { session: { user }, transaction };
  const { data, errors } = await server.executeOperation({
    query: gql,
    ...queryOptions
  });
  if (errors) failWithErrors(errors);
  return data;
};

const mutate = async (gql, options) => {
  return query(gql, options); // same as query
};

module.exports = { query, mutate };
