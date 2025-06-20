import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignLeft,
  faArrowLeft,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Col } from 'react-bootstrap';
import React, { useContext, useMemo } from 'react';
import { Context as CollectionJobContext } from './CollectionJobContext';
import styles from './TestNavigator.module.css';
import clsx from 'clsx';

const TestNavigator = ({
  show = true,
  isSignedIn = false,
  viewedTests = [],
  isVendor = false,
  testPlanReport = {},
  tests = [],
  currentTestIndex = 0,
  toggleShowClick = () => {},
  handleTestClick = () => {},
  testPlanRun = null,
  isReadOnly = false
}) => {
  const isBotCompletedTest = testPlanRun?.tester?.isBot;

  const {
    state: { collectionJob }
  } = useContext(CollectionJobContext);
  const testStatus = useMemo(
    () => collectionJob?.testStatus ?? [],
    [collectionJob]
  );

  const shouldShowFailingAssertionsSummary = useMemo(() => {
    return (
      isVendor &&
      (testPlanReport.metrics.mustAssertionsFailedCount > 0 ||
        testPlanReport.metrics.shouldAssertionsFailedCount > 0)
    );
  }, [isVendor, testPlanReport]);

  const shouldShowNegativeSideEffectsSummary = useMemo(() => {
    return isVendor && testPlanReport.metrics.unexpectedBehaviorCount > 0;
  }, [isVendor, testPlanReport]);

  return (
    <Col className={styles.testNavigator} md={show ? 3 : 12}>
      <div className={styles.testNavigatorToggleContainer}>
        <h2 id="test-navigator-heading">
          <button
            aria-label="Test Navigation"
            aria-controls="test-navigator-nav"
            aria-expanded={show ? 'true' : 'false'}
            onClick={toggleShowClick}
            className={styles.testNavigatorToggle}
          >
            {show ? (
              <FontAwesomeIcon icon={faArrowLeft} />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} />
            )}
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
        </h2>
      </div>
      <nav id="test-navigator-nav" hidden={!show} aria-label="Test">
        <ol
          aria-labelledby="test-navigator-heading"
          className={styles.testNavigatorList}
        >
          {shouldShowFailingAssertionsSummary && (
            <div className={clsx(styles.testNameWrapper, styles.summary)}>
              <a
                onClick={async e => {
                  e.preventDefault();
                  await handleTestClick(-1);
                }}
                href="#summary-assertions"
                className={styles.testName}
                aria-current={currentTestIndex === -1}
              >
                Summary of Failing Assertions
              </a>
              <span
                className={styles.progressIndicator}
                title="Summary of Failing Assertions"
              />
            </div>
          )}
          {shouldShowNegativeSideEffectsSummary && (
            <div className={clsx(styles.testNameWrapper, styles.summary)}>
              <a
                onClick={async e => {
                  e.preventDefault();
                  await handleTestClick(-2);
                }}
                href="#summary-side-effects"
                className={styles.testName}
                aria-current={currentTestIndex === -2}
              >
                Summary of Negative Side Effects
              </a>
              <span
                className={styles.progressIndicator}
                title="Summary of Negative Side Effects"
              />
            </div>
          )}
          {tests.map((test, index) => {
            let resultClassName = isReadOnly
              ? styles.missing
              : styles.notStarted;
            let resultStatus = isReadOnly ? 'Missing' : 'Not Started';

            const issuesExist = testPlanReport.issues?.filter(
              issue =>
                issue.isCandidateReview && issue.testRowNumber == test.rowNumber
            ).length;

            if (test) {
              if (isBotCompletedTest) {
                const { status } =
                  testStatus.find(ts => ts.test.id === test.id) ?? {};
                if (status === 'COMPLETED') {
                  if (test.testResult?.completedAt) {
                    resultClassName = styles.botComplete;
                    resultStatus = 'Completed by Bot';
                  } else {
                    resultClassName = styles.botOutputOnly;
                    resultStatus =
                      'Output Collected by Bot, Needs Assertion Verdicts';
                  }
                } else if (status === 'QUEUED') {
                  resultClassName = styles.botQueued;
                  resultStatus = 'Queued by Bot';
                } else if (status === 'RUNNING') {
                  resultClassName = styles.botRunning;
                  resultStatus = 'Running with Bot';
                } else if (status === 'ERROR') {
                  resultClassName = styles.botError;
                  resultStatus = 'Error collecting with Bot';
                } else if (status === 'CANCELLED') {
                  resultClassName = styles.botCancelled;
                  resultStatus = 'Cancelled by Bot';
                }
              } else {
                // Non-bot tests
                if (test.hasConflicts) {
                  resultClassName = styles.conflicts;
                  resultStatus = 'Has Conflicts';
                } else if (!test.testResult && isReadOnly) {
                  resultClassName = styles.missing;
                  resultStatus = 'Missing';
                } else if (test.testResult) {
                  resultClassName = test.testResult.completedAt
                    ? styles.complete
                    : styles.inProgress;
                  resultStatus = test.testResult.completedAt
                    ? 'Complete Test'
                    : 'In Progress';
                } else if (
                  !isSignedIn &&
                  !isVendor &&
                  test.index === currentTestIndex
                ) {
                  resultClassName = styles.inProgress;
                  resultStatus = 'In Progress';
                } else if (isVendor) {
                  if (issuesExist) {
                    resultClassName = styles.changesRequested;
                    resultStatus = 'Changes Requested';
                  } else if (viewedTests.includes(test.id)) {
                    resultClassName = styles.complete;
                    resultStatus = 'Test Viewed';
                  }
                }
              }
            }
            return (
              <li
                className={clsx(styles.testNameWrapper, resultClassName)}
                key={`TestNavigatorItem_${test.id}`}
              >
                <a
                  onClick={async e => {
                    e.preventDefault();
                    await handleTestClick(test.index);
                  }}
                  href={`#${index + 1}`}
                  className={styles.testName}
                  aria-current={test.index === currentTestIndex}
                >
                  {test.title}
                </a>
                <span
                  className={styles.progressIndicator}
                  title={`${resultStatus}`}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    </Col>
  );
};

TestNavigator.propTypes = {
  show: PropTypes.bool,
  isSignedIn: PropTypes.bool,
  isVendor: PropTypes.bool,
  testPlanReport: PropTypes.object,
  tests: PropTypes.array,
  testResult: PropTypes.object,
  conflicts: PropTypes.object,
  currentTestIndex: PropTypes.number,
  viewedTests: PropTypes.array,
  toggleShowClick: PropTypes.func,
  handleTestClick: PropTypes.func,
  testPlanRun: PropTypes.object,
  isReadOnly: PropTypes.bool
};

export default TestNavigator;
