import React from 'react';
import PropTypes from 'prop-types';

const AssertionDetails = ({ assertion }) => {
  const displayValue = (value, fallback = 'N/A') => {
    return value || fallback;
  };

  return (
    <div className="mb-2">
      <div>
        <strong>Test Name:</strong> {displayValue(assertion?.testTitle)}
      </div>
      <div>
        <strong>Command:</strong> {displayValue(assertion?.scenarioCommands)}
      </div>
      <div>
        <strong>Assertion:</strong> {displayValue(assertion?.assertionText)}
      </div>
      <div>
        <strong>AT Response:</strong> {displayValue(assertion?.output)}
      </div>
      <div>
        <strong>AT Version & Browser version:</strong>{' '}
        {assertion?.atVersionName || '—'}
        {assertion?.browserVersionName
          ? `, ${assertion.browserVersionName}`
          : ''}
      </div>
    </div>
  );
};

AssertionDetails.propTypes = {
  assertion: PropTypes.shape({
    testTitle: PropTypes.string,
    scenarioCommands: PropTypes.string,
    assertionText: PropTypes.string,
    output: PropTypes.string,
    atVersionName: PropTypes.string,
    browserVersionName: PropTypes.string
  })
};

export default AssertionDetails;
