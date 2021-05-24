const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
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

const { query: testClientQuery } = createTestClient(server);

const failWithErrors = errors => {
    let formatted = '';
    errors.forEach(error => {
        formatted +=
            `GraphQL error in ${JSON.stringify(error.path)}:\n\n` +
            `${error.message}\n\n` +
            `(${JSON.stringify({
                extensions: error.extensions,
                location: error.location
            })})\n`;
    });
    throw new Error(formatted);
};

/**
 * Returns the data from a given query, useful for situations where errors are
 * not expected and no query variables are needed.
 * @param {GraphQLSyntaxTree} gql - GraphQL query from a gql template string.
 * @example gql`query { me { username } }`
 * @param {object=} options
 * @param {object=} options.user - Replace the default user or set it to null
 * to simulate being logged out.
 * @returns {any} Data matching the query.
 */
const query = async (gql, { user = defaultUser } = {}) => {
    mockReq = { session: { user } };
    const { data, errors } = await testClientQuery({ query: gql });
    if (errors) failWithErrors(errors);
    return data;
};

/* TODO: function for mutations to go here when mutations are supported */

module.exports = { query };
