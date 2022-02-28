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

const httpLink = new HttpLink({ uri: `${process.env.API_SERVER}/api/graphql` });

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

const GraphQLProvider = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default GraphQLProvider;
