import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const ViewLogsButton = ({ externalLogsUrl }) => {
  const onClick = () => {
    window.open(externalLogsUrl, '_blank');
  };

  return (
    <Button
      disabled={!externalLogsUrl}
      aria-disabled={!externalLogsUrl}
      onClick={onClick}
      role="link"
      variant="secondary"
    >
      View Log
    </Button>
  );
};

ViewLogsButton.propTypes = {
  externalLogsUrl: PropTypes.string
};

export default ViewLogsButton;
