import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
// Order matters for the following two imports
import './scss/custom.scss';
import App from './components/App';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache({
        addTypename: false,
        typePolicies: {
            Query: {
                fields: {
                    testPlanReport: {
                        merge: true
                    },
                    testPlanReports: {
                        merge(existing, incoming) {
                            return incoming;
                        }
                    }
                }
            },
            Mutation: {
                fields: {
                    testPlanReport: {
                        merge(existing, incoming) {
                            return incoming;
                        }
                    },
                    testPlanRun: {
                        merge(existing, incoming) {
                            return incoming;
                        }
                    }
                }
            }
        }
    })
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>,
    document.getElementById('root')
);
