import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faCheck,
  faExclamationCircle,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { Context } from './CollectionJobContext';
import {
  COLLECTION_JOB_STATUS,
  isJobStatusFinal
} from '../../utils/collectionJobStatus';
import { TestResultPropType } from '../common/proptypes';
import styles from './Heading.module.css';
import commonStyles from '../common/styles.module.css';

const TestRunHeading = ({
  at,
  browser,
  editAtBrowserDetailsButtonRef,
  handleEditAtBrowserDetailsClick,
  isSignedIn,
  openAsUser,
  showEditAtBrowser,
  testPlanTitle,
  testPlanVersionString,
  testPlanVersionReviewLink,
  testResults,
  testIndex,
  testCount,
  isReadOnly
}) => {
  const {
    state: { collectionJob }
  } = useContext(Context);

  const renderTestsCompletedInfoBox = () => {
    let isReviewingBot = Boolean(openAsUser?.isBot);
    let content;

    if (isReviewingBot) {
      const countTestResults = testResults.reduce(
        (acc, { scenarioResults }) =>
          acc +
          (scenarioResults && scenarioResults.every(({ output }) => !!output)
            ? 1
            : 0),
        0
      );
      const countCompleteCollection = collectionJob.testStatus.reduce(
        (acc, { status }) =>
          acc + (status === COLLECTION_JOB_STATUS.COMPLETED ? 1 : 0),
        0
      );

      content = (
        <>
          <p>
            <b>{`${Math.max(
              countTestResults,
              countCompleteCollection
            )} of ${testCount}`}</b>{' '}
            responses collected
          </p>
          <p>
            Collection Job Status: <b>{collectionJob.status}</b>
          </p>
        </>
      );
    } else if (!isSignedIn) {
      content = <b>{testCount} tests to view</b>;
    } else if (testCount) {
      content = (
        <>
          <b>{`${testResults.reduce(
            (acc, { completedAt }) => acc + (completedAt ? 1 : 0),
            0
          )} of ${testCount}`}</b>{' '}
          tests completed
        </>
      );
    } else {
      content = <div>No tests for this AT and Browser combination</div>;
    }

    return (
      <div className={clsx(styles.testInfoEntity, styles.testsCompleted)}>
        <div data-testid="info-label">
          <FontAwesomeIcon icon={testCount ? faCheck : faExclamationCircle} />
          {content}
        </div>
      </div>
    );
  };

  let openAsUserHeading = null;

  if (openAsUser?.isBot) {
    openAsUserHeading = (
      <div
        className={clsx(styles.testInfoEntity, styles.reviewingAs, styles.bot)}
      >
        {isReadOnly ? 'Viewing' : 'Reviewing'} tests of{' '}
        <FontAwesomeIcon icon={faRobot} className="m-0" />{' '}
        <b>{`${openAsUser.username}`}.</b>
        {!isJobStatusFinal(collectionJob.status) && (
          <>
            <br />
            The collection bot is still updating information on this page.
            {isReadOnly ? '' : ' Changes may be lost when updates arrive.'}
          </>
        )}
      </div>
    );
  } else if (openAsUser) {
    let readOnlyStatus;
    if (isReadOnly) {
      const test = testResults[testIndex];
      if (!test) readOnlyStatus = 'unopened';
      else if (test.completedAt) readOnlyStatus = 'completed';
      else if (test.startedAt) readOnlyStatus = 'in progress';
    }

    openAsUserHeading = (
      <div className={clsx(styles.testInfoEntity, styles.reviewingAs)}>
        {isReadOnly ? (
          <>
            Viewing {readOnlyStatus} tests of <b>{openAsUser.username}</b> in
            read-only mode. <em>No changes can be made or saved.</em>
          </>
        ) : (
          <>
            Reviewing tests of <b>{openAsUser.username}</b>.{' '}
            <em>
              All changes will be saved as performed by {openAsUser.username}.
            </em>
          </>
        )}
      </div>
    );
  }

  const testPlanName = `${testPlanTitle} ${testPlanVersionString}`;
  return (
    <>
      <div className={styles.testInfoWrapper}>
        <div
          className={clsx(styles.testInfoEntity, styles.apgExampleName)}
          data-testid="apg-example-name"
        >
          <div data-testid="info-label">
            <b>Test Plan:</b>&nbsp;
            <a href={testPlanVersionReviewLink}>{testPlanName}</a>
          </div>
        </div>
        <div
          className={clsx(styles.testInfoEntity, styles.atBrowserContainer)}
          data-testid="at-browser-container"
        >
          <div className={styles.atBrowserRow}>
            <div data-testid="info-label">
              <b>AT:</b> {at}
            </div>
            <div data-testid="info-label">
              <b>Browser:</b> {browser}
            </div>
          </div>
          {showEditAtBrowser && (
            <Button
              ref={editAtBrowserDetailsButtonRef}
              id="edit-fa-button"
              aria-label="Edit version details for AT and Browser"
              onClick={handleEditAtBrowserDetailsClick}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
        </div>
        {renderTestsCompletedInfoBox()}
      </div>
      {openAsUserHeading}
    </>
  );
};

TestRunHeading.propTypes = {
  testPlanTitle: PropTypes.string.isRequired,
  testPlanVersionString: PropTypes.string.isRequired,
  testPlanVersionReviewLink: PropTypes.string.isRequired,
  at: PropTypes.string.isRequired,
  browser: PropTypes.string.isRequired,
  showEditAtBrowser: PropTypes.bool.isRequired,
  editAtBrowserDetailsButtonRef: PropTypes.object.isRequired,
  isSignedIn: PropTypes.bool.isRequired,
  openAsUser: PropTypes.shape({
    isBot: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired
  }),
  testResults: PropTypes.arrayOf(TestResultPropType),
  testIndex: PropTypes.number.isRequired,
  testCount: PropTypes.number.isRequired,
  handleEditAtBrowserDetailsClick: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool
};

export default TestRunHeading;
