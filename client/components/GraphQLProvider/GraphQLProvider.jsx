import React from 'react';
import PropTypes from 'prop-types';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
});

const GraphQLProvider = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

GraphQLProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default GraphQLProvider;
