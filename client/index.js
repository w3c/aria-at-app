import React from 'react';
import { createRoot } from 'react-dom/client';
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
    })
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ApolloProvider>
    </React.StrictMode>
);
