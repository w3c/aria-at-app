import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import store from './redux/store';
// Order matters for the following two imports
import './scss/custom.scss';
import App from './components/App';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache({ addTypename: false })
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </ApolloProvider>,
    document.getElementById('root')
);
