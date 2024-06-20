import React from 'react';
import PropTypes from 'prop-types';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  concat
} from '@apollo/client';

// Dynamically set GraphQL request headers
// See https://www.apollographql.com/docs/react/networking/advanced-http-networking#customizing-request-logic
const headerMiddleware = new ApolloLink((operation, forward) => {
  const currentTransactionId = sessionStorage.getItem('currentTransactionId');
  if (currentTransactionId) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'x-transaction-id': currentTransactionId
      }
    }));
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: concat(headerMiddleware, new HttpLink({ uri: '/api/graphql' })),
  cache: new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: {
          me: { merge: true },
          testPlanVersion: { merge: true },
          testPlanVersions: { merge: false },
          testPlanReport: { merge: true },
          testPlanReports: { merge: false },
          collectionJobByTestPlanRunId: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            }
          }
        }
      },
      Mutation: {
        fields: {
          testPlanReport: { merge: false },
          testPlanRun: { merge: false },
          testPlanVersion: { merge: false }
        }
      }
    }
  })
});

const resetCache = async () => {
  await client.clearStore();
};

const GraphQLProvider = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { resetCache };
export default GraphQLProvider;
