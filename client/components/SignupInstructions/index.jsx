import React from 'react';
import { Container } from 'react-bootstrap';

const SignupInstructions = () => {
    return (
        <Container as="main">
            <p>
                You are not registered with an authorized W3C GitHub team.
                Please create an issue at{' '}
                <a href="https://github.com/w3c/aria-at-app">
                    ARIA-AT App GitHub
                </a>
                .
            </p>
        </Container>
    );
};

export default SignupInstructions;
