import React from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const InvalidRequest = () => {
    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Invalid Request | ARIA-AT</title>
            </Helmet>
            <section className="invalid-request">
                <div>
                    <h1>Whoops! Unable to complete request</h1>
                </div>
            </section>
        </Container>
    );
};

export default InvalidRequest;
