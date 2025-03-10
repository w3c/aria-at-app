import React from 'react';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import clsx from 'clsx';
import styles from './PageStatus.module.css';

const Loading = ({
  title,
  heading,
  message = 'Loading ...',
  isError = false
}) => {
  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <h1>{heading}</h1>

      <div
        className={clsx(
          isError && 'alert alert-danger',
          message === 'Loading ...' && styles.loading
        )}
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
