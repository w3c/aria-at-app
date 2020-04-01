import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';

const App = ({ route }) => {
    return (
        <div>
            <h1>ARIA-AT REPORT</h1>
            {renderRoutes(route.routes)}
        </div>
    );
};

App.propTypes = {
    route: PropTypes.object
};

export default App;
