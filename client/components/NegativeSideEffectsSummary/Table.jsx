import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNegativeSideEffects } from '../../hooks/useNegativeSideEffects';
import { TestPlanReportPropType } from '../common/proptypes';

const NegativeSideEffectsSummaryTable = ({
  testPlanReport,
  getLinkUrl = assertion => `#result-${assertion.testId}`,
  LinkComponent = Link
}) => {
  const negativeSideEffects = useNegativeSideEffects(testPlanReport);
  const { metrics } = testPlanReport;

  if (metrics.unexpectedBehaviorCount.length === 0) return null;

  return (
    <>
      <Table
        bordered
        responsive
        aria-labelledby="negative-side-effects-heading"
      >
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Command</th>
            <th>Side Effect</th>
            <th>Details</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          {negativeSideEffects.map((assertion, index) => (
            <tr key={`negative-side-effects-${index}`}>
              <td>
                <LinkComponent to={getLinkUrl(assertion)}>
                  {assertion.testTitle}
                </LinkComponent>
              </td>
              <td>{assertion.scenarioCommands}</td>
              <td>{assertion.text}</td>
              <td>{assertion.details}</td>
              <td>{assertion.impact}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

NegativeSideEffectsSummaryTable.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  getLinkUrl: PropTypes.func,
  LinkComponent: PropTypes.elementType
};

export default NegativeSideEffectsSummaryTable;
