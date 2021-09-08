import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import './RunResultsPage.css';

const RunResultsPage = () => {
    const title = '';

    return (
        <Container as="main">
            <Helmet>
                <title>{title}</title>
            </Helmet>
        </Container>
    );
};

export default RunResultsPage;
