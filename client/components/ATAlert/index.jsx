import React from 'react';
import PropTypes from 'prop-types';
import './ATAlert.css';

const ATAlert = ({ message }) => {
    return (
        <div className="at-alert" role="status" aria-live="polite">
            {message}
        </div>
    );
};

ATAlert.propTypes = {
    message: PropTypes.string
};

export default ATAlert;
