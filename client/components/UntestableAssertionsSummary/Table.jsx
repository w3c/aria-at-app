import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUntestableAssertions } from '../../hooks/useUntestableAssertions';
import { TestPlanReportPropType } from '../common/proptypes';

const UntestableAssertionsSummaryTable = ({
  testPlanReport,
  atName,
  getLinkUrl = assertion => `#result-${assertion.testId}`,
  LinkComponent = Link
}) => {
  const untestableAssertions = useUntestableAssertions(testPlanReport);

  if (untestableAssertions.length === 0) return null;

  return (
    <Table bordered responsive aria-labelledby="untestable-assertions-heading">
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Command</th>
          <th>Assertion Priority</th>
          <th>Assertion</th>
          <th>{atName} Response</th>
        </tr>
      </thead>
      <tbody>
        {untestableAssertions.map((assertion, index) => (
          <tr key={`untestable-assertion-${index}`}>
            <td>
              <LinkComponent to={getLinkUrl(assertion)}>
                {assertion.testTitle}
              </LinkComponent>
            </td>
            <td>{assertion.scenarioCommands}</td>
            <td>{assertion.priority}</td>
            <td>{assertion.assertionText}</td>
            <td>{assertion.output}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

UntestableAssertionsSummaryTable.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  atName: PropTypes.string.isRequired,
  getLinkUrl: PropTypes.func,
  LinkComponent: PropTypes.elementType
};

export default UntestableAssertionsSummaryTable;
