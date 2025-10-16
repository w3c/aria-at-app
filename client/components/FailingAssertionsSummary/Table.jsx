import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useFailingAssertions } from '../../hooks/useFailingAssertions';
import { TestPlanReportPropType } from '../common/proptypes';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import LinkAtBugModal from './BugLinking';
import ReportAtBugModal from './ReportAtBugModal';
import styles from './FailingAssertionsSummary.module.css';

const FailingAssertionsSummaryTable = ({
  testPlanReport,
  atName,
  getLinkUrl = assertion => `#result-${assertion.testId}`,
  LinkComponent = Link,
  testPlanVersion
}) => {
  const failingAssertions = useFailingAssertions(testPlanReport);
  const { data: meData } = useQuery(ME_QUERY);
  const auth = evaluateAuth(meData?.me ? meData.me : {});
  const { isAdmin, isVendor } = auth;

  const canEdit = isAdmin || isVendor;

  const [selectedAssertion, setSelectedAssertion] = useState(null);
  const [reportAssertion, setReportAssertion] = useState(null);
  const [assertionUpdates, setAssertionUpdates] = useState({});
  const linkBugButtonRef = useRef();
  const { metrics } = testPlanReport;

  // Merge server data with local updates
  const displayAssertions = useMemo(() => {
    return failingAssertions.map(assertion => {
      const update = assertionUpdates[assertion.assertionId];
      return update || assertion;
    });
  }, [failingAssertions, assertionUpdates]);

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
            <th>Bug Reports</th>
          </tr>
        </thead>
        <tbody>
          {displayAssertions.map((assertion, index) => (
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
              <td
                className={assertion.isNegativeSideEffect ? 'text-muted' : ''}
              >
                {assertion.isNegativeSideEffect ? (
                  <span className="text-muted">N/A</span>
                ) : (
                  <>
                    <ul className="mb-2">
                      {assertion.assertionAtBugs &&
                      assertion.assertionAtBugs.length
                        ? assertion.assertionAtBugs.map(bug => (
                            <li key={bug.id}>
                              <a
                                href={bug.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {bug.at?.name && `${bug.at.name}#`}
                                {bug.bugId}: {bug.title}
                              </a>
                            </li>
                          ))
                        : !canEdit
                        ? 'None'
                        : ''}
                    </ul>
                    <div className={styles.bugReportsButtonContainer}>
                      {canEdit && (
                        <div className="mb-1">
                          <button
                            ref={linkBugButtonRef}
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedAssertion(assertion)}
                          >
                            Link {atName} Bug
                          </button>
                        </div>
                      )}
                      {canEdit && (
                        <div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setReportAssertion(assertion)}
                          >
                            Report {atName} Bug
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <LinkAtBugModal
        show={!!selectedAssertion}
        onClose={() => setSelectedAssertion(null)}
        atId={testPlanReport.at.id}
        atName={atName}
        assertion={selectedAssertion}
        onLinked={updatedAssertion => {
          setAssertionUpdates(prev => ({
            ...prev,
            [updatedAssertion.assertionId]: updatedAssertion
          }));
        }}
      />
      <ReportAtBugModal
        show={!!reportAssertion}
        onClose={() => setReportAssertion(null)}
        assertion={reportAssertion}
        testPlanReport={testPlanReport}
        testPlanVersion={testPlanVersion}
      />
    </>
  );
};

FailingAssertionsSummaryTable.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  atName: PropTypes.string.isRequired,
  getLinkUrl: PropTypes.func,
  LinkComponent: PropTypes.elementType,
  testPlanVersion: PropTypes.object.isRequired
};

export default FailingAssertionsSummaryTable;
