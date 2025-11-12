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
    typePolicies: {
      Query: {
        fields: {
          me: { merge: true },
          testPlanVersion: { merge: true },
          testPlanReport: { merge: true },
          collectionJobByTestPlanRunId: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            }
          }
        }
      },
      At: {
        keyFields: ['id']
      },
      AtVersion: {
        keyFields: ['id']
      },
      Browser: {
        keyFields: ['id']
      },
      BrowserVersion: {
        keyFields: ['id']
      },
      TestPlan: {
        keyFields: ['id']
      },
      TestPlanVersion: {
        keyFields: ['id']
      },
      TestPlanReport: {
        keyFields: ['id']
      },
      TestPlanRun: {
        keyFields: ['id']
      },
      TestResult: {
        keyFields: ['id']
      },
      CollectionJob: {
        keyFields: ['id']
      },
      User: {
        keyFields: ['id']
      },
      AriaHtmlFeaturesMetrics: {
        keyFields: false
      }
    }
  }),
  defaultOptions: {
    query: {
      errorPolicy: 'all'
    },
    watchQuery: {
      errorPolicy: 'all'
    }
  }
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
