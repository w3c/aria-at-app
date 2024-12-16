import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFailingAssertions } from '../../hooks/useFailingAssertions';
import { TestPlanReportPropType } from '../common/proptypes';

const FailingAssertionsSummary = ({ testPlanReport, atName }) => {
  const failingAssertions = useFailingAssertions(testPlanReport);
  const { metrics } = testPlanReport;

  if (failingAssertions.length === 0) return null;

  return (
    <section>
      <h2 id="failing-assertions-heading">
        Summary of Failing Assertions ({metrics.mustAssertionsFailedCount} must,{' '}
        {metrics.shouldAssertionsFailedCount} should)
      </h2>
      <p>
        {metrics.assertionsFailedCount} assertions failed for{' '}
        {metrics.commandsCount} commands in {metrics.testsFailedCount} tests.
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
                <Link to={`#result-${assertion.testId}`}>
                  {assertion.testTitle}
                </Link>
              </td>
              <td>{assertion.scenarioCommands}</td>
              <td>{assertion.priority}</td>
              <td>{assertion.assertionText}</td>
              <td>{assertion.output}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
};

FailingAssertionsSummary.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  atName: PropTypes.string.isRequired
};

export default FailingAssertionsSummary;
