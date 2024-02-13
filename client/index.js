import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Order matters for the following two imports
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import GraphQLProvider from './components/GraphQLProvider';
import { AriaLiveRegionProvider } from './components/providers/AriaLiveRegionProvider';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <GraphQLProvider>
        <AriaLiveRegionProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AriaLiveRegionProvider>
    </GraphQLProvider>
);
