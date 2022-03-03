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
import { getNumberOfActiveQueries } from './waitForGraphQL';

// Only required for Jest's Node-based environment
const origin = typeof jest !== 'undefined' ? process.env.API_SERVER : '';

const httpLink = new HttpLink({
    uri: `${origin}/api/graphql`
});

let numberOfActiveQueries = 0;
const isLoadingMiddleware = new ApolloLink((operation, forward) => {
    numberOfActiveQueries += 1;
    getNumberOfActiveQueries(numberOfActiveQueries);
    return forward(operation).map(response => {
        numberOfActiveQueries -= 1;
        getNumberOfActiveQueries(numberOfActiveQueries);
        return response;
    });
});

const client = new ApolloClient({
    cache: new InMemoryCache({
        typePolicies: {
            TestPlanReportOperations: { merge: false },
            TestPlanRunOperations: { merge: false },
            User: { fields: { ats: { merge: false } } }
        }
    }),
    link: concat(isLoadingMiddleware, httpLink)
});

const GraphQLProvider = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default GraphQLProvider;
