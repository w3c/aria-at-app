import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFailingAssertions } from '../../hooks/useFailingAssertions';
import { TestPlanReportPropType } from '../common/proptypes';

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
        {failingAssertions.length} of {failingAssertions.totalAssertionsCount}{' '}
        total assertions fail across:
      </p>
      <ul>
        <li>
          {metrics.testsFailedCount} test
          {metrics.testsFailedCount === 1 ? '' : 's'}
        </li>
        <li>
          {failingAssertions.uniqueAssertionStatementsCount} unique assertion
          statement
          {failingAssertions.uniqueAssertionStatementsCount === 1 ? '' : 's'}
        </li>
        <li>
          {failingAssertions.uniqueCommandsCount} unique command
          {failingAssertions.uniqueCommandsCount === 1 ? '' : 's'}
        </li>
      </ul>

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
