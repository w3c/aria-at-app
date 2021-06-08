import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import store from './store';
// Order matters for the following two imports
import './scss/custom.scss';
import App from './components/App';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <Provider store={store}>
            <App />
        </Provider>
    </ApolloProvider>,
    document.getElementById('root')
);
