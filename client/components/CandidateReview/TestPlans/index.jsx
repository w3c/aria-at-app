import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Helmet } from 'react-helmet';
import { Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DisclosureComponent from '../../common/DisclosureComponent';
import {
  faFlag,
  faCheck,
  faCommentAlt
} from '@fortawesome/free-solid-svg-icons';
import alphabetizeObjectBy from '@client/utils/alphabetizeObjectBy';
import {
  getTestPlanTargetTitle,
  getTestPlanVersionTitle
} from '@components/Reports/getTitles';
import ProgressBar from '@components/common/ProgressBar';
import { None } from '@components/common/None';
import { dates } from 'shared';
import { calculations } from 'shared';
import { AtPropType, UserPropType } from '../../common/proptypes';
import styles from '../CandidateReview.module.css';
import commonStyles from '../../common/styles.module.css';

const none = None();
const noneNoTestPlans = None('No Test Plans to Review', {
  customClassNames: 'p-3'
});

const TestPlans = ({ testPlanVersions, ats, me }) => {
  const testPlanReportsExist = testPlanVersions.some(
    testPlanVersion => testPlanVersion.testPlanReports.length
  );

  if (!testPlanReportsExist) {
    return (
      <Container
        id="main"
        as="main"
        tabIndex="-1"
        className={commonStyles.fhContainer}
      >
        <Helmet>
          <title>Candidate Review | ARIA-AT</title>
        </Helmet>
        <h1>Candidate Review</h1>
        <p>There are no results to show just yet. Please check back soon!</p>
      </Container>
    );
  }

  const getRowStatus = ({
    issues = [],
    isInProgressStatusExists,
    isApprovedStatusExists
  }) => {
    let issueChangesRequestedTypeCount = 0;
    let issueFeedbackTypeCount = 0;

    for (let i = 0; i < issues.length; i++) {
      if (issues[i].feedbackType === 'CHANGES_REQUESTED')
        issueChangesRequestedTypeCount++;
      else issueFeedbackTypeCount++;
    }

    const changesRequestedContent = (
      <>
        <span className={clsx(styles.statusText, styles.changesRequested)}>
          <FontAwesomeIcon icon={faFlag} />
          Changes requested for {issueChangesRequestedTypeCount} test
          {issueChangesRequestedTypeCount !== 1 ? 's' : ''}
        </span>
      </>
    );

    const issueFeedbackContent = (
      <>
        <span className={clsx(styles.statusText, styles.feedback)}>
          <FontAwesomeIcon icon={faCommentAlt} />
          Feedback left for {issueFeedbackTypeCount} test
          {issueFeedbackTypeCount !== 1 ? 's' : ''}
        </span>
      </>
    );

    const approvedContent = (
      <>
        <span className={clsx(styles.statusText, styles.approved)}>
          <FontAwesomeIcon icon={faCheck} />
          Approved
        </span>
      </>
    );

    const inProgressContent = (
      <>
        <span className={clsx(styles.statusText, styles.inProgress)}>
          <span className="dot" aria-hidden={true} />
          Review in Progress
        </span>
      </>
    );

    const readyForReviewContent = (
      <>
        <span className={clsx(styles.statusText, styles.readyForReview)}>
          <span className="dot" aria-hidden={true} />
          Ready for Review
        </span>
      </>
    );

    let result = null;
    if (issueChangesRequestedTypeCount) result = changesRequestedContent;
    else if (issueFeedbackTypeCount) {
      result = issueFeedbackContent;
      if (isApprovedStatusExists)
        result = (
          <>
            {result && (
              <>
                {result}
                <br />
                <br />
              </>
            )}
            {approvedContent}
          </>
        );
    } else if (isInProgressStatusExists) result = inProgressContent;
    else if (isApprovedStatusExists) result = approvedContent;
    else result = readyForReviewContent;

    return result;
  };

  const evaluateTestsAssertionsMessage = ({
    totalSupportPercent,
    browsersLength,
    totalTestsFailedCount,
    totalAssertionsFailedCount
  }) => {
    if (totalSupportPercent === 100) {
      return (
        <>
          <b>No assertions</b> failed
        </>
      );
    } else {
      return (
        <>
          <b>
            {totalAssertionsFailedCount} assertion
            {totalAssertionsFailedCount !== 1 ? 's' : ''}
          </b>{' '}
          failed across{' '}
          <b>
            {totalTestsFailedCount} test
            {totalTestsFailedCount !== 1 ? 's' : ''}
          </b>{' '}
          run with{' '}
          <b>
            {browsersLength} browser
            {browsersLength !== 1 ? 's' : ''}
          </b>
        </>
      );
    }
  };

  const uniqueFilter = (element, unique, key) => {
    const isDuplicate = unique.includes(element[key]);
    if (!isDuplicate) {
      unique.push(element[key]);
      return true;
    }
    return false;
  };

  const constructTableForAtById = (atId, atName) => {
    const testPlanReportsForAtExists = testPlanVersions.some(testPlanVersion =>
      testPlanVersion.testPlanReports.some(
        testPlanReport => testPlanReport.at.id == atId
      )
    );

    // return 'None' element if no reports exists for AT
    if (!testPlanReportsForAtExists) {
      return (
        <DisclosureComponent
          expanded
          className={styles.candidateReviewCustomDisclosureComponent}
          componentId="candidateReviewRuns"
          title={atName}
          disclosureContainerView={<div className="p-3">{noneNoTestPlans}</div>}
        />
      );
    }

    let testPlanTargetsById = {};
    testPlanVersions.forEach(testPlanVersion => {
      const { testPlanReports } = testPlanVersion;

      testPlanReports.forEach(testPlanReport => {
        const { at, browser } = testPlanReport;
        // Construct testPlanTarget
        const testPlanTarget = {
          id: `${at.id}${browser.id}`,
          at,
          browser
        };
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
      });
    });
    testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
      getTestPlanTargetTitle(keyValue[1])
    );

    return (
      <DisclosureComponent
        expanded
        className={styles.candidateReviewCustomDisclosureComponent}
        componentId="candidateReviewRuns"
        title={atName}
        disclosureContainerView={
          <Table bordered responsive aria-label={atName}>
            <thead>
              <tr>
                <th>Candidate Test Plans</th>
                <th className={commonStyles.centeredText}>Last Updated</th>
                <th className={commonStyles.centeredText}>
                  Target Completion Date
                </th>
                <th className={commonStyles.centeredText}>Review Status</th>
                <th className={commonStyles.centeredText}>Results Summary</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(testPlanVersions)
                .sort((a, b) => (a.title < b.title ? -1 : 1))
                .map(testPlanVersion => {
                  const testPlanReports =
                    testPlanVersion.testPlanReports.filter(
                      ({ at }) => at.id === atId
                    );
                  const candidatePhaseReachedAt =
                    testPlanVersion.candidatePhaseReachedAt;
                  const recommendedPhaseTargetDate =
                    testPlanVersion.recommendedPhaseTargetDate;

                  const allMetrics = [];

                  let testsCount = 0;
                  let dataExists = false;

                  Object.values(testPlanTargetsById).map(testPlanTarget => {
                    const testPlanReport = testPlanReports.find(
                      testPlanReport =>
                        testPlanReport.at.id === testPlanTarget.at.id &&
                        testPlanReport.at.id === atId &&
                        testPlanReport.browser.id === testPlanTarget.browser.id
                    );

                    if (testPlanReport) {
                      const metrics = testPlanReport.metrics;
                      allMetrics.push(metrics);

                      if (!dataExists && testPlanReport.at.id === atId) {
                        dataExists = true;
                      }

                      testsCount =
                        metrics.testsCount > testsCount
                          ? metrics.testsCount
                          : testsCount;
                    }
                  });

                  const metrics = {
                    testsCount,
                    browsersLength: allMetrics.length,
                    totalTestsFailedCount: allMetrics.reduce(
                      (acc, obj) => acc + obj.testsFailedCount,
                      0
                    ),
                    totalAssertionsFailedCount: allMetrics.reduce(
                      (acc, obj) =>
                        acc +
                        obj.shouldAssertionsFailedCount +
                        obj.mustAssertionsFailedCount,
                      0
                    ),
                    totalSupportPercent: calculations.trimDecimals(
                      allMetrics.reduce(
                        (acc, obj) => acc + obj.supportPercent,
                        0
                      ) / allMetrics.length
                    )
                  };

                  // Make sure issues are unique
                  const uniqueLinks = [];
                  const allIssues = testPlanReports
                    .map(testPlanReport => [...testPlanReport.issues])
                    .flat()
                    .filter(t => t.isCandidateReview === true)
                    .filter(t => uniqueFilter(t, uniqueLinks, 'link'));

                  const canReview =
                    me.roles.includes('ADMIN') ||
                    (me.roles.includes('VENDOR') &&
                      me.company.ats.some(at => at.id === atId));

                  const getTitleEl = () => {
                    if (canReview) {
                      return (
                        <Link
                          to={`/candidate-test-plan/${testPlanVersion.id}/${atId}`}
                        >
                          {getTestPlanVersionTitle(testPlanVersion, {
                            includeVersionString: true
                          })}{' '}
                          ({testsCount} Test
                          {testsCount === 0 || testsCount > 1 ? `s` : ''})
                        </Link>
                      );
                    }
                    return (
                      <>
                        {getTestPlanVersionTitle(testPlanVersion, {
                          includeVersionString: true
                        })}{' '}
                        ({testsCount} Test
                        {testsCount === 0 || testsCount > 1 ? `s` : ''})
                      </>
                    );
                  };
                  return (
                    dataExists && (
                      <tr key={testPlanVersion.id}>
                        <th>{getTitleEl()}</th>
                        <td
                          className={clsx(
                            commonStyles.centeredText,
                            commonStyles.vertical
                          )}
                        >
                          <i>
                            {dates.convertDateToString(
                              candidatePhaseReachedAt,
                              'MMM D, YYYY'
                            )}
                          </i>
                        </td>
                        <td
                          className={clsx(
                            commonStyles.centeredText,
                            commonStyles.vertical
                          )}
                        >
                          <i>
                            {dates.convertDateToString(
                              recommendedPhaseTargetDate,
                              'MMM D, YYYY'
                            )}
                          </i>
                        </td>
                        <td
                          className={clsx(
                            commonStyles.centeredText,
                            commonStyles.vertical
                          )}
                        >
                          {getRowStatus({
                            issues: allIssues,
                            isInProgressStatusExists: testPlanReports.some(
                              testPlanReport =>
                                testPlanReport.vendorReviewStatus ===
                                'IN_PROGRESS'
                            ),
                            isApprovedStatusExists: testPlanReports.some(
                              testPlanReport =>
                                testPlanReport.vendorReviewStatus === 'APPROVED'
                            )
                          })}
                        </td>
                        <td
                          className={clsx(
                            commonStyles.centeredText,
                            commonStyles.vertical
                          )}
                        >
                          <Link
                            to={`/candidate-test-plan/${testPlanVersion.id}/${atId}`}
                            aria-label={`${metrics.totalSupportPercent}%`}
                          >
                            <ProgressBar
                              progress={metrics.totalSupportPercent}
                            />
                          </Link>
                          <span className={styles.cellRow}>
                            <i>{evaluateTestsAssertionsMessage(metrics)}</i>
                          </span>
                        </td>
                      </tr>
                    )
                  );
                })}
            </tbody>
          </Table>
        }
      />
    );
  };

  const constructTableForResultsSummary = () => {
    if (!testPlanReportsExist)
      return (
        <>
          <h3>Review Status Summary</h3>
          {noneNoTestPlans}
        </>
      );

    let testPlanTargetsById = {};
    testPlanVersions.forEach(testPlanVersion => {
      const { testPlanReports } = testPlanVersion;

      testPlanReports.forEach(testPlanReport => {
        const { at, browser } = testPlanReport;
        // Construct testPlanTarget
        const testPlanTarget = {
          id: `${at.id}${browser.id}`,
          at,
          browser
        };
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
      });
    });
    testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
      getTestPlanTargetTitle(keyValue[1])
    );

    return (
      <>
        <h3>Review Status Summary</h3>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Test Plan</th>
              {ats.map(({ name }) => (
                <th
                  className={commonStyles.centeredText}
                  key={`CenteredTh_${name}`}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(testPlanVersions)
              .sort((a, b) => (a.title < b.title ? -1 : 1))
              .map(testPlanVersion => {
                const testPlanReports = testPlanVersion.testPlanReports;

                const calculatedAtsData = ats.map(at => {
                  let dataExists = false;
                  while (!dataExists) {
                    Object.values(testPlanTargetsById).forEach(
                      testPlanTarget => {
                        const testPlanReport = testPlanReports.find(
                          testPlanReport =>
                            testPlanReport.at.id === testPlanTarget.at.id &&
                            testPlanReport.browser.id ===
                              testPlanTarget.browser.id
                        );

                        if (testPlanReport && testPlanReport.at.id === at.id)
                          dataExists = true;
                      }
                    );
                  }

                  // TODO: Evaluate if uniqueLinks is necessary
                  const uniqueLinks = [];
                  const issues = [
                    ...testPlanReports
                      .filter(t => t.at.id === at.id)
                      .flatMap(({ issues }) => issues)
                      .filter(t => uniqueFilter(t, uniqueLinks, 'link'))
                  ];

                  return {
                    id: at.id,
                    key: at.key,
                    name: at.name,
                    reports: testPlanReports.filter(t => t.at.id === at.id),
                    dataExists,
                    issues
                  };
                });

                return (
                  <tr key={testPlanVersion.id}>
                    <td>
                      {getTestPlanVersionTitle(testPlanVersion, {
                        includeVersionString: true
                      })}
                    </td>
                    {calculatedAtsData.map(data => {
                      return (
                        <td
                          key={`CenteredTd_Summary_${data.key}`}
                          className={clsx(
                            commonStyles.centeredText,
                            commonStyles.vertical
                          )}
                        >
                          {data.dataExists
                            ? getRowStatus({
                                issues: data.issues,
                                isInProgressStatusExists: data.reports.some(
                                  report =>
                                    report.vendorReviewStatus === 'IN_PROGRESS'
                                ),
                                isApprovedStatusExists: data.reports.some(
                                  report =>
                                    report.vendorReviewStatus === 'APPROVED'
                                )
                              })
                            : none}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <Container
      id="main"
      as="main"
      tabIndex="-1"
      className={commonStyles.fhContainer}
    >
      <Helmet>
        <title>Candidate Review | ARIA-AT</title>
      </Helmet>
      <h1>Candidate Review</h1>
      <h2>Introduction</h2>
      <p>
        This page summarizes the test results for each AT and Browser which
        executed the Test Plan.
      </p>
      {ats.map(({ id, name }) => constructTableForAtById(id, name))}
      {constructTableForResultsSummary()}
    </Container>
  );
};

TestPlans.propTypes = {
  testPlanVersions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      phase: PropTypes.string.isRequired,
      gitSha: PropTypes.string,
      testPlan: PropTypes.shape({
        directory: PropTypes.string
      }),
      metadata: PropTypes.object,
      testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          metrics: PropTypes.object.isRequired,
          at: PropTypes.object.isRequired,
          browser: PropTypes.object.isRequired
        })
      )
    })
  ).isRequired,
  ats: PropTypes.arrayOf(AtPropType).isRequired,
  me: UserPropType.isRequired,
  triggerPageUpdate: PropTypes.func
};

export default TestPlans;
