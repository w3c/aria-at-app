import React from 'react';
import PropTypes from 'prop-types';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: {
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
          testPlanRun: { merge: false }
        }
      }
    }
  })
});

const GraphQLProvider = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default GraphQLProvider;
