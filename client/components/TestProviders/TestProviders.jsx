import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import GraphQLProvider from '../GraphQLProvider';

const TestProviders = ({ setInitialUrl = null, children }) => {
    return (
        <GraphQLProvider>
            <MemoryRouter
                initialEntries={setInitialUrl ? [setInitialUrl] : undefined}
            >
                {children}
            </MemoryRouter>
        </GraphQLProvider>
    );
};

TestProviders.propTypes = {
    setInitialUrl: PropTypes.string,
    children: PropTypes.node.isRequired
};

export default TestProviders;
