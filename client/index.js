import React from 'react';
import ReactDOM from 'react-dom';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';
import routes from './routes';

ReactDOM.render(
    <BrowserRouter>
        <div>{renderRoutes(routes)}</div>
    </BrowserRouter>,
    document.getElementById('root')
);
