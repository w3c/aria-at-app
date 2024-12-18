import React from 'react';
import { TestPlanReportMetricsPropType } from '../common/proptypes';
import PropTypes from 'prop-types';

const FailingAssertionsSummaryHeading = ({ metrics, as: Element = 'h2' }) => {
  return (
    <Element id="failing-assertions-heading">
      Summary of Failing Assertions ({metrics.mustAssertionsFailedCount} must,{' '}
      {metrics.shouldAssertionsFailedCount} should)
    </Element>
  );
};

FailingAssertionsSummaryHeading.propTypes = {
  metrics: TestPlanReportMetricsPropType.isRequired,
  as: PropTypes.elementType
};

export default FailingAssertionsSummaryHeading;
