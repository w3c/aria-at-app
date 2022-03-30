import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import GraphQLProvider from '../GraphQLProvider';

const TestProviders = ({ role = null, children }) => {
    const [sessionStarted, setSessionStarted] = useState(false);

    useEffect(() => {
        (async () => {
            if (!role) return;

            const response = await fetch(
                `${process.env.API_SERVER}/api/auth/integration-test-sign-in?role=${role}`,
                { method: 'POST', credentials: 'include' }
            );
            if (response.ok) {
                setSessionStarted(true);
            } else {
                throw new Error('Failed to complete integration test sign in');
            }
        })();

        return async () => {
            // TODO
        };
    }, []);

    if (!sessionStarted && role) return null;

    return (
        <GraphQLProvider>
            <MemoryRouter>{children}</MemoryRouter>
        </GraphQLProvider>
    );
};

TestProviders.propTypes = {
    role: PropTypes.oneOf(['admin', 'tester']),
    children: PropTypes.node.isRequired
};

export default TestProviders;
