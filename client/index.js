import React from 'react';
import ReactDOM from 'react-dom';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './scss/custom.scss';
import routes from './routes';
import store from './store';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <Provider store={store}>
            <BrowserRouter>
                <div>{renderRoutes(routes)}</div>
            </BrowserRouter>
        </Provider>
    </ApolloProvider>,
    document.getElementById('root')
);
