import React from 'react';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const Loading = ({
    title,
    heading,
    message = 'Loading ...',
    isError = false
}) => {
    return (
        <Container as="main">
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <h1>{heading}</h1>

            <div
                className={isError ? 'alert alert-danger' : ''}
                role={isError ? 'alert' : ''}
                data-testid="page-status"
            >
                {message}
            </div>
        </Container>
    );
};

Loading.propTypes = {
    title: PropTypes.string,
    heading: PropTypes.string,
    message: PropTypes.string,
    isError: PropTypes.bool
};

export default Loading;
