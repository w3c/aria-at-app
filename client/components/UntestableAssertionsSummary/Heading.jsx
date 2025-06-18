import React from 'react';
import { TestPlanReportMetricsPropType } from '../common/proptypes';
import PropTypes from 'prop-types';

const UntestableAssertionsSummaryHeading = ({
  metrics,
  as: Element = 'h2'
}) => {
  return (
    <Element id="untestable-assertions-heading">
      Summary of Untestable Assertions ({metrics.mustAssertionsUntestableCount}{' '}
      must, {metrics.shouldAssertionsUntestableCount} should,{' '}
      {metrics.mayAssertionsUntestableCount} may)
    </Element>
  );
};

UntestableAssertionsSummaryHeading.propTypes = {
  metrics: TestPlanReportMetricsPropType.isRequired,
  as: PropTypes.elementType
};

export default UntestableAssertionsSummaryHeading;
