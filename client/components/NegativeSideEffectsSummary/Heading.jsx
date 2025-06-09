import React from 'react';
import { TestPlanReportMetricsPropType } from '../common/proptypes';
import PropTypes from 'prop-types';

const NegativeSideEffectsSummaryHeading = ({ metrics, as: Element = 'h2' }) => {
  return (
    <Element id="negative-side-effects-heading">
      Summary of Negative Side Effects (
      {metrics.severeImpactFailedAssertionCount} severe,{' '}
      {metrics.moderateImpactFailedAssertionCount} moderate)
    </Element>
  );
};

NegativeSideEffectsSummaryHeading.propTypes = {
  metrics: TestPlanReportMetricsPropType.isRequired,
  as: PropTypes.elementType
};

export default NegativeSideEffectsSummaryHeading;
