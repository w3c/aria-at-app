import React from 'react';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import './PageStatus.css';

const Loading = ({
    title,
    heading,
    message = 'Loading ...',
    isError = false
}) => {
    let className = isError ? 'alert alert-danger' : '';
    className = message === 'Loading ...' ? `${className} loading` : className;

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <h1>{heading}</h1>

            <div
                className={className}
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
