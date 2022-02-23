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
import {
    IsGraphQLLoadingProvider,
    getNumberOfActiveQueries
} from './IsGraphQLLoadingProvider';

const httpLink = new HttpLink({ uri: '/api/graphql' });
const testHttpLink = new HttpLink({ uri: 'http://localhost:5000/api/graphql' });

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
    cache: new InMemoryCache({ addTypename: false }),
    link: concat(isLoadingMiddleware, httpLink)
});
const testClient = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: concat(isLoadingMiddleware, testHttpLink)
});

const GraphQLProvider = ({ isTestMode = false, children }) => {
    return (
        <ApolloProvider client={isTestMode ? testClient : client}>
            <IsGraphQLLoadingProvider>{children}</IsGraphQLLoadingProvider>
        </ApolloProvider>
    );
};

GraphQLProvider.propTypes = {
    isTestMode: PropTypes.bool,
    children: PropTypes.node.isRequired
};

export default GraphQLProvider;
