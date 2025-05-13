import React from 'react';
import { TestPlanReportMetricsPropType } from '../common/proptypes';
import PropTypes from 'prop-types';

const NegativeSideEffecsSummaryHeading = ({ metrics, as: Element = 'h2' }) => {
  return (
    <Element id="negative-side-effects-heading">
      Summary of Negative Side Effects (
      {metrics.severeImpactFailedAssertionCount} severe,{' '}
      {metrics.moderateImpactFailedAssertionCount} moderate)
    </Element>
  );
};

NegativeSideEffecsSummaryHeading.propTypes = {
  metrics: TestPlanReportMetricsPropType.isRequired,
  as: PropTypes.elementType
};

export default NegativeSideEffecsSummaryHeading;
