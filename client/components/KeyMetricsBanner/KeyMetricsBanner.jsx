import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';

const KeyMetricsBanner = () => {
  //   const [showBanner, setShowBanner] = useState(true);

  return (
    <Alert
      variant="primary"
      //   show={showBanner}
      //   onClose={() => setShowBanner(false)}
      //   dismissible
    >
      As of <strong>Sep 4, 2025</strong>, <strong>20,455</strong> interop
      verdicts for <strong>799</strong> AT commands enabled by{' '}
      <strong>37</strong> contributors, <strong>1113</strong> verdicts in the
      last 90 days.
    </Alert>
  );
};

export default KeyMetricsBanner;
