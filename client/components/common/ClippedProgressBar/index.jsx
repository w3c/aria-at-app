import React from 'react';
import PropTypes from 'prop-types';
import './ClippedProgressBar.css';

const ProgressBar = ({ progress = 0, label = '', clipped = true }) => {
  return (
    <>
      {clipped ? (
        <div className="progress clipped" aria-label={label}>
          <div
            className="front"
            style={{
              clipPath: `inset(0 0 0 ${progress}%)`
            }}
          >
            {progress}%
          </div>
          <div className="back">{progress}%</div>
        </div>
      ) : (
        <div className="progress" aria-label={label}>
          <div
            className="progress-bar bg-info"
            style={{
              width: `${progress}%`
            }}
          >
            {progress}%
          </div>
        </div>
      )}
    </>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  label: PropTypes.string,
  clipped: PropTypes.bool
};

export default ProgressBar;
