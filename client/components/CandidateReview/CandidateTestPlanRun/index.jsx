import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import clsx from 'clsx';
import TestNavigator from '../../TestRun/TestNavigator';
import InstructionsRenderer from './InstructionsRenderer';
import OptionButton from '../../TestRun/OptionButton';
import PageStatus from '../../common/PageStatus';
import { navigateTests } from '../../../utils/navigateTests';
import {
  ADD_VIEWER_MUTATION,
  CANDIDATE_REPORTS_QUERY,
  PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION
} from './queries';
import { Badge, Container, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getMetrics, dates } from 'shared';
import { useMediaQuery } from 'react-responsive';
import TestPlanResultsTable from '../../common/TestPlanResultsTable';
import ProvideFeedbackModal from '../CandidateModals/ProvideFeedbackModal';
import ApprovedModal from '../CandidateModals/ApprovedModal';
import FeedbackListItem from '../FeedbackListItem';
import DisclosureComponent from '../../common/DisclosureComponent';
import createIssueLink, {
  getIssueSearchLink
} from '../../../utils/createIssueLink';
import RunHistory from '../../common/RunHistory';
import { useUrlTestIndex } from '../../../hooks/useUrlTestIndex';
import NotApprovedModal from '../CandidateModals/NotApprovedModal';
import FailingAssertionsSummaryTable from '../../FailingAssertionsSummary/Table';
import FailingAssertionsSummaryHeading from '../../FailingAssertionsSummary/Heading';
import styles from './CandidateTestPlanRun.module.css';
import feedbackStyles from '../FeedbackListItem/FeedbackListItem.module.css';
import testRunStyles from '../../TestRun/TestRun.module.css';
import testRunHeadingStyles from '../../TestRun/Heading.module.css';
import failingAssertionsSummaryStyles from '../../FailingAssertionsSummary/FailingAssertionsSummary.module.css';

const CandidateTestPlanRun = () => {
  const { atId, testPlanVersionId } = useParams();
  const navigate = useNavigate();

  let testPlanVersionIds = [];
  if (testPlanVersionId.includes(','))
    testPlanVersionIds = testPlanVersionId.split(',');

  const { loading, data, error, refetch } = useQuery(CANDIDATE_REPORTS_QUERY, {
    variables: testPlanVersionIds.length
      ? { testPlanVersionIds, atId }
      : { testPlanVersionId, atId }
  });
  const [addViewer] = useMutation(ADD_VIEWER_MUTATION);
  const [promoteVendorReviewStatus] = useMutation(
    PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION
  );

  const nextButtonRef = useRef();
  const finishButtonRef = useRef();

  const [reviewStatus, setReviewStatus] = useState('');
  const [firstTimeViewing, setFirstTimeViewing] = useState(false);
  const [viewedTests, setViewedTests] = useState([]);
  const [testsLength, setTestsLength] = useState(0);
  const [currentTestIndex, setCurrentTestIndex] = useUrlTestIndex({
    minTestIndex: -1,
    maxTestIndex: testsLength
  });
  const [showTestNavigator, setShowTestNavigator] = useState(true);
  const [isFirstTest, setIsFirstTest] = useState(currentTestIndex === 0);
  const [isLastTest, setIsLastTest] = useState(false);
  const [feedbackModalShowing, setFeedbackModalShowing] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showBrowserBools, setShowBrowserBools] = useState([]);
  const [showRunHistory, setShowRunHistory] = useState(false);
  const [showBrowserClicks, setShowBrowserClicks] = useState([]);

  const isSummaryView = currentTestIndex === -1;

  const isLaptopOrLarger = useMediaQuery({
    query: '(min-width: 792px)'
  });

  const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);

  const hasFailingAssertionsSummary = useMemo(() => {
    return data?.testPlanReports[0]?.metrics?.assertionsFailedCount > 0;
  }, [data?.testPlanReports]);
  const handleTestClick = async index => {
    setCurrentTestIndex(index);
    if (index === -1) {
      // Summary view
      setIsFirstTest(false);
      setIsLastTest(false);
    } else if (index === 0) {
      setIsFirstTest(true);
      setIsLastTest(false);
    } else if (index === tests.length - 1) {
      setIsFirstTest(false);
      setIsLastTest(true);
    } else {
      setIsFirstTest(false);
      setIsLastTest(false);
    }
  };

  const handleNextTestClick = async () => {
    navigateTests(
      false,
      currentTest,
      tests,
      setCurrentTestIndex,
      setIsFirstTest,
      setIsLastTest
    );
  };
  const handlePreviousTestClick = async () => {
    const { isFirstTest } = navigateTests(
      true,
      currentTest,
      tests,
      setCurrentTestIndex,
      setIsFirstTest,
      setIsLastTest
    );
    if (isFirstTest) nextButtonRef.current.focus();
  };

  const addViewerToTest = async testId => {
    await addViewer({ variables: { testPlanVersionId, testId } });
  };

  const updateTestViewed = async () => {
    if (!currentTest) return;
    const userPreviouslyViewedTest = viewedTests.includes(currentTest.id);
    if (!userPreviouslyViewedTest) {
      setFirstTimeViewing(true);
      setViewedTests(tests => [...tests, currentTest.id]);
      await addViewerToTest(currentTest.id);
      await refetch();
    } else {
      setFirstTimeViewing(false);
    }
  };

  const updateVendorStatus = async (reportApproved = false) => {
    if (reviewStatus === 'READY') {
      await Promise.all(
        testPlanReports?.map(report =>
          promoteVendorReviewStatus({
            variables: { testReportId: report.id, reviewStatus }
          })
        )
      );
      setReviewStatus('IN_PROGRESS');
    } else if (reviewStatus === 'IN_PROGRESS' && reportApproved) {
      await Promise.all(
        testPlanReports?.map(report =>
          promoteVendorReviewStatus({
            variables: { testReportId: report.id, reviewStatus }
          })
        )
      );
      setReviewStatus('APPROVED');
    }
  };

  const submitApproval = async (status = '') => {
    if (status === 'APPROVED') {
      await updateVendorStatus(true);
      setConfirmationModal(
        <ApprovedModal
          handleAction={async () => {
            setConfirmationModal(null);
            navigate('/candidate-review');
          }}
          githubUrl={generalFeedbackUrl}
        />
      );
    } else {
      setConfirmationModal(
        <NotApprovedModal
          handleAction={async () => {
            setConfirmationModal(null);
            navigate('/candidate-review');
          }}
          githubUrl={generalFeedbackUrl}
        />
      );
    }
    setFeedbackModalShowing(false);
  };

  useEffect(() => {
    if (data) {
      if (
        !tests[0].viewers?.find(viewer => viewer.username === data.me.username)
      ) {
        addViewerToTest(tests[0].id).then(() => {
          setFirstTimeViewing(true);
        });
      }
      const viewedTests = [
        tests[0].id,
        ...tests
          .filter(test =>
            test.viewers?.find(viewer => viewer.username === data.me.username)
          )
          .map(test => test.id)
      ];
      setViewedTests(viewedTests);
      setReviewStatus(vendorReviewStatus);

      const bools = testPlanReports.map(() => false);
      setShowBrowserBools(bools);

      const browserClicks = testPlanReports.map((report, index) => () => {
        setShowBrowserBools(browserBools => {
          let bools = [...browserBools];
          bools[index] = !bools[index];
          return bools;
        });
      });
      setTestsLength(tests.length);
      setShowBrowserClicks(browserClicks);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      updateVendorStatus();
      updateTestViewed();
      setIsFirstTest(currentTestIndex === 0);
      if (tests?.length === 1) setIsLastTest(true);
      if (currentTestIndex + 1 === tests?.length) setIsLastTest(true);
    }
  }, [reviewStatus, currentTestIndex, data]);

  useEffect(() => {
    // Prevent a plan with only 1 test from immediately pushing the focus to the
    // submit button
    if (isLastTest && tests?.length !== 1) finishButtonRef.current.focus();
  }, [isLastTest]);

  if (error)
    return (
      <PageStatus
        title="Candidate Test Run Page | ARIA-AT"
        heading="Candidate Test Run Page"
        message={error.message}
        isError
      />
    );

  if (loading) {
    return (
      <PageStatus
        title="Loading - Candidate Test Run Page | ARIA-AT"
        heading="Candidate Test Run Page"
      />
    );
  }

  if (!data) return null;

  const atMap = {
    1: 'JAWS',
    2: 'NVDA',
    3: 'VoiceOver for macOS'
  };
  const at = atMap[atId];

  const testPlanReports = [];
  const _testPlanReports = data.testPlanReports;
  if (_testPlanReports.length === 0) return <Navigate to="/404" replace />;

  const getLatestReleasedAtVersionReport = arr => {
    return arr.reduce((o1, o2) => {
      return new Date(o1.latestAtVersionReleasedAt.releasedAt) >
        new Date(o2.latestAtVersionReleasedAt.releasedAt)
        ? o1
        : o2;
    });
  };

  Object.keys(atMap).forEach(k => {
    const group = _testPlanReports.filter(t => t.browser.id == k);
    if (group.length) {
      const latestReport = getLatestReleasedAtVersionReport(group);
      testPlanReports.push(latestReport);
    }
  });

  const testPlanReport = testPlanReports.find(
    each =>
      each.testPlanVersion.id === testPlanVersionId ||
      testPlanVersionIds.includes(each.testPlanVersion.id)
  );

  const tests = testPlanReport.runnableTests.map((test, index) => ({
    ...test,
    index,
    seq: index + 1
  }));

  const currentTest = tests[currentTestIndex];
  const { testPlanVersion, vendorReviewStatus } = testPlanReport;
  const { recommendedPhaseTargetDate } = testPlanVersion;

  const vendorReviewStatusMap = {
    READY: 'Ready',
    IN_PROGRESS: 'In Progress',
    APPROVED: 'Approved'
  };

  const reviewStatusText = vendorReviewStatusMap[reviewStatus];

  const targetCompletionDate = dates.convertDateToString(
    new Date(recommendedPhaseTargetDate),
    'MMMM D, YYYY'
  );

  // Assumes that the issues are across the entire AT/Browser combination
  const changesRequestedIssues = testPlanReport.issues?.filter(
    issue =>
      issue.isCandidateReview &&
      issue.feedbackType === 'CHANGES_REQUESTED' &&
      issue.testNumberFilteredByAt === currentTest?.seq
  );

  const feedbackIssues = testPlanReport.issues?.filter(
    issue =>
      issue.isCandidateReview &&
      issue.feedbackType === 'FEEDBACK' &&
      issue.testNumberFilteredByAt === currentTest?.seq
  );

  const issue = {
    isCandidateReview: true,
    isCandidateReviewChangesRequested: true,
    testPlanTitle: testPlanVersion.title,
    testPlanDirectory: testPlanVersion.testPlan.directory,
    versionString: testPlanVersion.versionString,
    testTitle: currentTest?.title,
    testRowNumber: currentTest?.rowNumber,
    testSequenceNumber: currentTest?.seq,
    testRenderedUrl: currentTest?.renderedUrl,
    atName: testPlanReport.at.name
  };

  const requestChangesUrl = createIssueLink(issue);

  const feedbackUrl = createIssueLink({
    ...issue,
    isCandidateReviewChangesRequested: false
  });

  const generalFeedbackUrl = createIssueLink({
    ...issue,
    isCandidateReviewChangesRequested: false,
    testTitle: undefined,
    testRowNumber: undefined,
    testRenderedUrl: undefined
  });

  const issueQuery = {
    isCandidateReview: true,
    isCandidateReviewChangesRequested: false,
    testPlanTitle: testPlanVersion.title,
    versionString: testPlanVersion.versionString,
    testRowNumber: currentTest?.rowNumber,
    username: data.me.username,
    atName: testPlanReport.at.name
  };

  const feedbackGithubUrl = getIssueSearchLink(issueQuery);

  const changesRequestedGithubUrl = getIssueSearchLink({
    ...issueQuery,
    isCandidateReviewChangesRequested: true
  });

  let fileBugUrl;

  const githubAtLabelMap = {
    'VoiceOver for macOS': 'vo',
    JAWS: 'jaws',
    NVDA: 'nvda'
  };

  if (githubAtLabelMap[at] === 'vo') {
    fileBugUrl = 'https://bugs.webkit.org/buglist.cgi?quicksearch=voiceover';
  } else if (githubAtLabelMap[at] === 'nvda') {
    fileBugUrl = 'https://github.com/nvaccess/nvda/issues';
  } else {
    fileBugUrl =
      'https://github.com/FreedomScientific/VFO-standards-support/issues';
  }

  const getHeading = () => {
    return (
      <div className="p-0">
        {isSummaryView ? (
          <>
            <span className={testRunStyles.taskLabel}>
              Candidate Test Plan Review
            </span>
            <FailingAssertionsSummaryHeading
              metrics={testPlanReport.metrics}
              as="h1"
            />
          </>
        ) : (
          <>
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              Viewing Test {currentTest.title}, Test {currentTest.seq} of{' '}
              {tests.length}
              {currentTest.seq === tests.length
                ? 'You are on the last test.'
                : ''}
            </div>
            <span className={testRunStyles.taskLabel}>
              Reviewing Test {currentTest.seq} of {tests.length}:
            </span>
            <h1>
              {`${currentTest.seq}. ${currentTest.title}`}{' '}
              <span className={styles.using}>using</span> {`${at}`}{' '}
              {`${testPlanReport?.latestAtVersionReleasedAt?.name ?? ''}`}
              {viewedTests.includes(currentTest.id) && !firstTimeViewing && ' '}
              {viewedTests.includes(currentTest.id) && !firstTimeViewing && (
                <Badge className={styles.viewedBadge} pill variant="secondary">
                  Previously Viewed
                </Badge>
              )}
            </h1>
          </>
        )}
      </div>
    );
  };

  const getTestInfo = () => {
    return (
      <div className={testRunHeadingStyles.testInfoWrapper}>
        <div
          className={clsx(
            testRunHeadingStyles.testInfoEntity,
            testRunHeadingStyles.apgExampleName
          )}
        >
          <div>
            <b>Candidate Test Plan:</b>{' '}
            <a href={`/test-review/${testPlanVersion.id}`}>
              {`${
                testPlanVersion.title ||
                testPlanVersion.testPlan?.directory ||
                ''
              } ${testPlanVersion.versionString}`}
            </a>
          </div>
        </div>
        <div
          className={clsx(
            testRunHeadingStyles.testInfoEntity,
            testRunHeadingStyles.reviewStatus
          )}
        >
          <div>
            <b>Review status by {at} Representative:</b>{' '}
            {`${reviewStatusText} `}
          </div>
        </div>
        <div
          className={clsx(
            testRunHeadingStyles.testInfoEntity,
            testRunHeadingStyles.targetDate
          )}
        >
          <div>
            <b>Target Completion Date: </b>
            {targetCompletionDate}
          </div>
        </div>
      </div>
    );
  };

  const getFeedback = () => {
    if (isSummaryView) {
      return null;
    }
    return (
      testPlanReport.issues.filter(
        issue =>
          issue.isCandidateReview &&
          issue.testNumberFilteredByAt == currentTest.seq
      ).length > 0 && (
        <div className={styles.issuesContainer}>
          <h2>
            <span className={feedbackStyles.feedbackFromText}>
              Feedback from
            </span>{' '}
            <b>{at} Representative</b>
          </h2>
          <ul>
            {[changesRequestedIssues, feedbackIssues].map((list, index) => {
              if (list.length > 0) {
                const uniqueAuthors = [
                  ...new Set(list.map(issue => issue.author))
                ];
                const differentAuthors = !(
                  uniqueAuthors.length === 1 &&
                  uniqueAuthors[0] === data.me.username
                );
                return (
                  <FeedbackListItem
                    key={`${index}-issues`}
                    differentAuthors={differentAuthors}
                    type={index === 0 ? 'changes-requested' : 'feedback'}
                    issues={list}
                    individualTest={true}
                    githubUrl={getIssueSearchLink({
                      isCandidateReview: true,
                      isCandidateReviewChangesRequested: index === 0,
                      atName: testPlanReport.at.name,
                      testPlanTitle: testPlanVersion.title,
                      versionString: testPlanVersion.versionString,
                      testSequenceNumber: currentTest.seq
                    })}
                  />
                );
              }
            })}
          </ul>
        </div>
      )
    );
  };

  const getContent = () => {
    return (
      <div className="p-0">
        {isSummaryView ? (
          <div
            className={
              failingAssertionsSummaryStyles.failingAssertionsSummaryTableContainer
            }
          >
            <FailingAssertionsSummaryTable
              testPlanReport={testPlanReports[0]}
              atName={at}
              getLinkUrl={assertion => `#${assertion.testIndex + 1}`}
            />
          </div>
        ) : (
          <>
            <h1 className="border-0" data-testid="current-test-title">
              {currentTest.title}
            </h1>
            <DisclosureComponent
              componentId="candidateReviewRun"
              headingLevel="1"
              title={[
                'Test Instructions',
                ...testPlanReports.map(
                  testPlanReport =>
                    `Test Results for ${testPlanReport.browser.name}`
                ),
                'Run History'
              ]}
              onClick={[
                () => setShowInstructions(!showInstructions),
                ...showBrowserClicks,
                () => setShowRunHistory(!showRunHistory)
              ]}
              expanded={[showInstructions, ...showBrowserBools, showRunHistory]}
              disclosureContainerView={[
                <InstructionsRenderer
                  customClassNames={
                    styles.candidateReviewCustomInstructionsRenderer
                  }
                  key={`instructions-${currentTest.id}`}
                  at={testPlanReport.at}
                  test={currentTest}
                  testPageUrl={testPlanReport.testPlanVersion.testPageUrl}
                  testFormatVersion={testPlanVersion.metadata.testFormatVersion}
                />,
                ...testPlanReports.map(testPlanReport => {
                  const testResult =
                    testPlanReport.finalizedTestResults[currentTestIndex];

                  const {
                    assertionsPassedCount,
                    mustAssertionsFailedCount,
                    shouldAssertionsFailedCount,
                    mayAssertionsFailedCount
                  } = getMetrics({ testResult });

                  const mustShouldAssertionsFailedCount =
                    mustAssertionsFailedCount + shouldAssertionsFailedCount;

                  return (
                    <>
                      <h2 className={styles.testResultsHeader}>
                        Test Results&nbsp;(
                        {assertionsPassedCount} passed,&nbsp;
                        {mustShouldAssertionsFailedCount} failed,&nbsp;
                        {mayAssertionsFailedCount} unsupported)
                      </h2>
                      <TestPlanResultsTable
                        key={`${testPlanReport.id} + ${testResult.id}`}
                        test={{ ...currentTest, at: { name: at } }}
                        testResult={testResult}
                      />
                    </>
                  );
                }),
                <RunHistory
                  key="run-history"
                  testPlanReports={testPlanReports}
                  testId={currentTest.id}
                />
              ]}
            ></DisclosureComponent>
          </>
        )}
      </div>
    );
  };

  return (
    <Container>
      <Helmet>
        <title>Candidate Test Run Page | ARIA-AT</title>
      </Helmet>
      <Row>
        <TestNavigator
          isVendor={true}
          testPlanReport={testPlanReports[0]}
          show={showTestNavigator}
          tests={tests}
          currentTestIndex={currentTestIndex}
          toggleShowClick={toggleTestNavigator}
          handleTestClick={handleTestClick}
          viewedTests={viewedTests}
        />
        <Col id="main" as="main" tabIndex="-1">
          <Row>
            {getHeading()}
            {getTestInfo()}
            <Col className="p-0">
              <Row xs={1} s={1} md={2}>
                <Col className="p-0" md={isLaptopOrLarger ? 9 : 12}>
                  <Row>{getFeedback()}</Row>
                  <Row className={styles.candidateResultsContainer}>
                    {getContent()}
                  </Row>
                  <Row>
                    <ul
                      aria-labelledby="test-toolbar-heading"
                      className={testRunStyles.testRunToolbar}
                    >
                      {isSummaryView ||
                      (isFirstTest && !hasFailingAssertionsSummary) ? null : (
                        <li>
                          <Button
                            variant="secondary"
                            onClick={handlePreviousTestClick}
                            disabled={isSummaryView}
                          >
                            {isFirstTest ? 'Summary' : 'Previous Test'}
                          </Button>
                        </li>
                      )}
                      {isSummaryView ? (
                        <li className={styles.beginReviewButtonContainer}>
                          <Button
                            ref={nextButtonRef}
                            variant="secondary"
                            onClick={handleNextTestClick}
                            disabled={isLastTest}
                          >
                            Begin Review
                          </Button>
                        </li>
                      ) : (
                        <li>
                          <Button
                            ref={nextButtonRef}
                            variant="primary"
                            onClick={handleNextTestClick}
                            disabled={isLastTest}
                          >
                            Next Test
                          </Button>
                        </li>
                      )}
                      <li>
                        <Button
                          ref={finishButtonRef}
                          variant="primary"
                          onClick={() => {
                            setFeedbackModalShowing(true);
                          }}
                          disabled={!isLastTest}
                        >
                          Finish
                        </Button>
                      </li>
                    </ul>
                  </Row>
                </Col>
                <Col
                  className={clsx(
                    testRunStyles.currentTestOptions,
                    getFeedback() && styles.optionsFeedback
                  )}
                  md={isLaptopOrLarger ? 3 : 8}
                >
                  <div role="complementary">
                    <h2 id="test-options-heading">Test Review Options</h2>
                    <ul
                      className={testRunStyles.optionsWrapper}
                      aria-labelledby="test-options-heading"
                    >
                      <li>
                        <OptionButton
                          text="Request Changes"
                          target="_blank"
                          href={requestChangesUrl}
                        />
                      </li>
                      <li>
                        <OptionButton
                          text="Leave Feedback"
                          target="_blank"
                          href={feedbackUrl}
                        />
                      </li>
                      <li>
                        <OptionButton
                          text="File an AT bug"
                          target="_blank"
                          href={fileBugUrl}
                        />
                      </li>
                      <li className={testRunStyles.helpLink}>
                        <a href="mailto:public-aria-at@w3.org">
                          Email us if you need help
                        </a>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      {feedbackModalShowing && (
        <ProvideFeedbackModal
          at={at}
          show={true}
          username={data.me.username}
          testPlan={testPlanVersion.title}
          feedbackIssues={testPlanReport.issues?.filter(
            issue =>
              issue.isCandidateReview &&
              issue.feedbackType === 'FEEDBACK' &&
              issue.author === data.me.username
          )}
          feedbackGithubUrl={feedbackGithubUrl}
          changesRequestedIssues={testPlanReport.issues?.filter(
            issue =>
              issue.isCandidateReview &&
              issue.feedbackType === 'CHANGES_REQUESTED' &&
              issue.author === data.me.username
          )}
          changesRequestedGithubUrl={changesRequestedGithubUrl}
          handleAction={submitApproval}
          handleHide={() => setFeedbackModalShowing(false)}
        />
      )}
      {!!confirmationModal && confirmationModal}
    </Container>
  );
};

export default CandidateTestPlanRun;
