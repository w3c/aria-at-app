import React from 'react';

import { Container } from 'react-bootstrap';

const NotFound = () => {
    return (
        <Container as="main">
            <section className="not-found">
                <div>
                    <h1>Whoooops! Page not found</h1>
                </div>
            </section>
        </Container>
    );
};

export default NotFound;
