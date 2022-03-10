import React from 'react';
import './LoadingSpinner.css';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ percentage = null, className = null }) => {
    return (
        <div
            className={
                className
                    ? `spinner-container ${className}`
                    : 'spinner-container'
            }
        >
            {percentage === null ? null : (
                <div
                    className="percentage"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {percentage}%
                </div>
            )}

            <svg className="spinner" viewBox="0 0 50 50">
                <title>Spinner</title>
                <circle
                    className="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="3"
                ></circle>
            </svg>
        </div>
    );
};

LoadingSpinner.propTypes = {
    className: PropTypes.string,
    percentage: PropTypes.number
};

export default LoadingSpinner;
