import React from 'react';
import PropTypes from 'prop-types';

const AssertionDetails = ({ assertion }) => {
  return (
    <div className="mb-2">
      <div>
        <strong>Test Name:</strong> {assertion?.testTitle}
      </div>
      <div>
        <strong>Command:</strong> {assertion?.scenarioCommands}
      </div>
      <div>
        <strong>Assertion:</strong> {assertion?.assertionText}
      </div>
      <div>
        <strong>AT Response:</strong> {assertion?.output}
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
