import React from 'react';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const Loading = ({ title, heading, message = 'Loading ...' }) => {
    return (
        <Container as="main">
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <h1>{heading}</h1>

            <div data-testid="test-run-loading">{message}</div>
        </Container>
    );
};

Loading.propTypes = {
    title: PropTypes.string.required,
    heading: PropTypes.string.required,
    message: PropTypes.string
};

export default Loading;
