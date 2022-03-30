import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
// Order matters for the following two imports
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import GraphQLProvider from './components/GraphQLProvider/GraphQLProvider';

ReactDOM.render(
    <GraphQLProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </GraphQLProvider>,
    document.getElementById('root')
);
