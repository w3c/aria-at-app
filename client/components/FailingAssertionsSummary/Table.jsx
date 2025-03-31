import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFailingAssertions } from '../../hooks/useFailingAssertions';
import { TestPlanReportPropType } from '../common/proptypes';
import './FailingAssertionsSummary.css';

const FailingAssertionsSummaryTable = ({
  testPlanReport,
  atName,
  getLinkUrl = assertion => `#result-${assertion.testId}`,
  LinkComponent = Link
}) => {
  const failingAssertions = useFailingAssertions(testPlanReport);
  const { metrics } = testPlanReport;

  if (failingAssertions.length === 0) return null;

  return (
    <>
      <p>
        {failingAssertions.length} assertion
        {failingAssertions.length === 1 ? '' : 's'} failed for{' '}
        {failingAssertions.uniqueCommandsCount} command
        {failingAssertions.uniqueCommandsCount === 1 ? '' : 's'} in{' '}
        {metrics.testsFailedCount} test
        {metrics.testsFailedCount === 1 ? '' : 's'}.
      </p>

      <Table bordered responsive aria-labelledby="failing-assertions-heading">
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
          {failingAssertions.map((assertion, index) => (
            <tr key={`failing-assertion-${index}`}>
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
    </>
  );
};

FailingAssertionsSummaryTable.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  atName: PropTypes.string.isRequired,
  getLinkUrl: PropTypes.func,
  LinkComponent: PropTypes.elementType
};

export default FailingAssertionsSummaryTable;
