import React from 'react';
import PropTypes from 'prop-types';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Only required for Jest's Node-based environment
const origin = typeof jest !== 'undefined' ? process.env.API_SERVER : '';

const client = new ApolloClient({
    cache: new InMemoryCache({
        addTypename: false,
        typePolicies: {
            TestPlanReportOperations: { merge: false },
            TestPlanRunOperations: { merge: false },
            TestPlanVersion: { fields: { testPlan: { merge: false } } },
            User: { fields: { ats: { merge: false } } },
            Query: {
                fields: {
                    testPlanReport: { merge: true },
                    testPlanReports: { merge: false }
                }
            },
            Mutation: {
                fields: {
                    testPlanReport: { merge: false },
                    testPlanRun: { merge: false }
                }
            }
        }
    }),
    uri: `${origin}/api/graphql`
});

const GraphQLProvider = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default GraphQLProvider;
