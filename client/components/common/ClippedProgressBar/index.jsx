import React from 'react';
import PropTypes from 'prop-types';
import './ClippedProgressBar.css';

const ProgressBar = ({ progress = 0, clipped = true, decorative }) => {
  return (
    <>
      {clipped ? (
        <div className="progress clipped">
          <div
            className="front"
            style={{
              clipPath: `inset(0 0 0 ${progress}%)`
            }}
          >
            {decorative ? null : `${progress}%`}
          </div>
          <div className="back">{decorative ? null : `${progress}%`}</div>
        </div>
      ) : (
        <div className="progress">
          <div
            className="progress-bar bg-info"
            style={{
              width: `${progress}%`
            }}
          >
            {decorative ? null : `${progress}%`}
          </div>
        </div>
      )}
    </>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  clipped: PropTypes.bool,
  decorative: PropTypes.bool
};

export default ProgressBar;
