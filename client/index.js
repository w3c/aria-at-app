import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
// Order matters for the following two imports
import './scss/custom.scss';
import App from './components/App';
import GraphQLProvider from './components/GraphQLProvider';

ReactDOM.render(
    <GraphQLProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </GraphQLProvider>,
    document.getElementById('root')
);
