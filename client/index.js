import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Store from './store';
import { Provider } from 'react-redux';
import store from './redux/store';
// Order matters for the following two imports
import './scss/custom.scss';
import App from './components/App';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client={client}>
        {/*<Provider store={store}>*/}
        <Store>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Store>
        {/*</Provider>*/}
    </ApolloProvider>,
    document.getElementById('root')
);
