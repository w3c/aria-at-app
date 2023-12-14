import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './CandidateTestPlanRun.css';
import '../../TestRun/TestRun.css';
import '../../App/App.css';
import { useMediaQuery } from 'react-responsive';
import { convertDateToString } from '../../../utils/formatter';
import TestPlanResultsTable from '../../common/TestPlanResultsTable';
import { calculateAssertionsCount } from '../../common/TestPlanResultsTable/utils';
import ProvideFeedbackModal from '../CandidateModals/ProvideFeedbackModal';
import ThankYouModal from '../CandidateModals/ThankYouModal';
import FeedbackListItem from '../FeedbackListItem';
import DisclosureComponent from '../../common/DisclosureComponent';
import createIssueLink, {
    getIssueSearchLink
} from '../../../utils/createIssueLink';

const CandidateTestPlanRun = () => {
    const { atId, testPlanVersionId } = useParams();
    const navigate = useNavigate();

    let testPlanVersionIds = [];
    if (testPlanVersionId.includes(','))
        testPlanVersionIds = testPlanVersionId.split(',');

    const { loading, data, error, refetch } = useQuery(
        CANDIDATE_REPORTS_QUERY,
        {
            variables: testPlanVersionIds.length
                ? { testPlanVersionIds, atId }
                : { testPlanVersionId, atId }
        }
    );
    const [addViewer] = useMutation(ADD_VIEWER_MUTATION);
    const [promoteVendorReviewStatus] = useMutation(
        PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION
    );

    const nextButtonRef = useRef();
    const finishButtonRef = useRef();

    const [reviewStatus, setReviewStatus] = useState('');
    const [firstTimeViewing, setFirstTimeViewing] = useState(false);
    const [viewedTests, setViewedTests] = useState([]);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [isFirstTest, setIsFirstTest] = useState(true);
    const [isLastTest, setIsLastTest] = useState(false);
    const [feedbackModalShowing, setFeedbackModalShowing] = useState(false);
    const [thankYouModalShowing, setThankYouModalShowing] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showBrowserBools, setShowBrowserBools] = useState([]);
    const [showBrowserClicks, setShowBrowserClicks] = useState([]);

    const isLaptopOrLarger = useMediaQuery({
        query: '(min-width: 792px)'
    });

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);

    const handleTestClick = async index => {
        setCurrentTestIndex(index);
        if (index === 0) {
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
        const userPreviouslyViewedTest = viewedTests.includes(currentTest.id);
        if (!userPreviouslyViewedTest) {
            setFirstTimeViewing(true);
            setViewedTests(tests => [...tests, currentTest.id]);
            await addViewerToTest(currentTest.id);
            refetch();
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
            updateVendorStatus(true);
        }
        setFeedbackModalShowing(false);
        setThankYouModalShowing(true);
    };

    useEffect(() => {
        if (data) {
            if (
                !tests[0].viewers?.find(
                    viewer => viewer.username === data.me.username
                )
            ) {
                addViewerToTest(tests[0].id);
                setFirstTimeViewing(true);
            }
            const viewedTests = [
                tests[0].id,
                ...tests
                    .filter(test =>
                        test.viewers?.find(
                            viewer => viewer.username === data.me.username
                        )
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

            setShowBrowserClicks(browserClicks);
        }
    }, [data]);

    useEffect(() => {
        if (data) {
            updateVendorStatus();
        }
    }, [reviewStatus]);

    useEffect(() => {
        if (data) {
            updateTestViewed();
        }
    }, [currentTestIndex]);

    useEffect(() => {
        if (data) {
            setIsLastTest(tests?.length === 1);
        }
    }, [data, tests]);

    useEffect(() => {
        if (isLastTest) finishButtonRef.current.focus();
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

    const targetCompletionDate = convertDateToString(
        new Date(recommendedPhaseTargetDate),
        'MMMM D, YYYY'
    );

    // Assumes that the issues are across the entire AT/Browser combination
    const changesRequestedIssues = testPlanReport.issues?.filter(
        issue =>
            issue.isCandidateReview &&
            issue.feedbackType === 'CHANGES_REQUESTED' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );

    const feedbackIssues = testPlanReport.issues?.filter(
        issue =>
            issue.isCandidateReview &&
            issue.feedbackType === 'FEEDBACK' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );

    const issue = {
        isCandidateReview: true,
        isCandidateReviewChangesRequested: true,
        testPlanTitle: testPlanVersion.title,
        testPlanDirectory: testPlanVersion.testPlan.directory,
        versionString: testPlanVersion.versionString,
        testTitle: currentTest.title,
        testRowNumber: currentTest.rowNumber,
        testRenderedUrl: currentTest.renderedUrl,
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
        testRowNumber: currentTest.rowNumber,
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

    if (githubAtLabelMap[at] == 'vo') {
        fileBugUrl =
            'https://bugs.webkit.org/buglist.cgi?quicksearch=voiceover';
    } else if (githubAtLabelMap[at] == 'nvda') {
        fileBugUrl = 'https://github.com/nvaccess/nvda/issues';
    } else {
        fileBugUrl =
            'https://github.com/FreedomScientific/VFO-standards-support/issues';
    }

    const heading = (
        <div className="test-info-heading">
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                Viewing Test {currentTest.title}, Test {currentTest.seq} of{' '}
                {tests.length}
                {currentTest.seq === tests.length
                    ? 'You are on the last test.'
                    : ''}
            </div>
            <span className="task-label">
                Reviewing Test {currentTest.seq} of {tests.length}:
            </span>
            <h1>
                {`${currentTest.seq}. ${currentTest.title}`}{' '}
                <span className="using">using</span> {`${at}`}
                {viewedTests.includes(currentTest.id) &&
                    !firstTimeViewing &&
                    ' '}
                {viewedTests.includes(currentTest.id) && !firstTimeViewing && (
                    <Badge className="viewed-badge" pill variant="secondary">
                        Previously Viewed
                    </Badge>
                )}
            </h1>
        </div>
    );

    const testInfo = (
        <div className="test-info-wrapper">
            <div className="test-info-entity apg-example-name">
                <div className="info-label">
                    <b>Candidate Test Plan:</b>{' '}
                    {`${
                        testPlanVersion.title ||
                        testPlanVersion.testPlan?.directory ||
                        ''
                    }`}
                </div>
            </div>
            <div className="test-info-entity review-status">
                <div className="info-label">
                    <b>Review status by {at} Representative:</b>{' '}
                    {`${reviewStatusText} `}
                </div>
            </div>
            <div className="test-info-entity target-date">
                <div className="info-label">
                    <b>Target Completion Date: </b>
                    {targetCompletionDate}
                </div>
            </div>
        </div>
    );

    const feedback = testPlanReport.issues.filter(
        issue =>
            issue.isCandidateReview &&
            issue.testNumberFilteredByAt == currentTest.seq
    ).length > 0 && (
        <div className="issues-container">
            <h2>
                <span className="feedback-from-text">Feedback from</span>{' '}
                <b>{at} Representative</b>
            </h2>
            <ul className="feedback-list">
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
                                type={
                                    index === 0
                                        ? 'changes-requested'
                                        : 'feedback'
                                }
                                issues={list}
                                individualTest={true}
                                githubUrl={getIssueSearchLink({
                                    isCandidateReview: true,
                                    isCandidateReviewChangesRequested:
                                        index === 0,
                                    atName: testPlanReport.at.name,
                                    testPlanTitle: testPlanVersion.title,
                                    versionString:
                                        testPlanVersion.versionString,
                                    testRowNumber: currentTest.rowNumber
                                })}
                            />
                        );
                    }
                })}
            </ul>
        </div>
    );

    const results = (
        <div className="results-container">
            <h1 className="current-test-title">{currentTest.title}</h1>
            <DisclosureComponent
                componentId="test-instructions-and-results"
                headingLevel="1"
                title={[
                    'Test Instructions',
                    ...testPlanReports.map(
                        testPlanReport =>
                            `Test Results for ${testPlanReport.browser.name}`
                    )
                ]}
                onClick={[
                    () => setShowInstructions(!showInstructions),
                    ...showBrowserClicks
                ]}
                expanded={[showInstructions, ...showBrowserBools]}
                disclosureContainerView={[
                    <InstructionsRenderer
                        key={`instructions-${currentTest.id}`}
                        at={testPlanReport.at}
                        test={currentTest}
                        testPageUrl={testPlanReport.testPlanVersion.testPageUrl}
                        testFormatVersion={
                            testPlanVersion.metadata.testFormatVersion
                        }
                    />,
                    ...testPlanReports.map(testPlanReport => {
                        const testResult =
                            testPlanReport.finalizedTestResults[
                                currentTestIndex
                            ];

                        const { passedAssertionsCount, failedAssertionsCount } =
                            calculateAssertionsCount(testResult);

                        return (
                            <>
                                <h2 className="test-results-header">
                                    Test Results&nbsp;(
                                    {passedAssertionsCount} passed,&nbsp;
                                    {failedAssertionsCount} failed)
                                </h2>
                                <TestPlanResultsTable
                                    key={`${testPlanReport.id} + ${testResult.id}`}
                                    test={{ ...currentTest, at: { name: at } }}
                                    testResult={testResult}
                                />
                            </>
                        );
                    })
                ]}
                stacked
            ></DisclosureComponent>
        </div>
    );

    return (
        <Container className="test-run-container">
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
                <Col
                    className="candidate-test-area"
                    id="main"
                    as="main"
                    tabIndex="-1"
                >
                    <Row>
                        {heading}
                        {testInfo}
                        <Col className="results-container-col">
                            <Row xs={1} s={1} md={2}>
                                <Col
                                    className="results-container"
                                    md={isLaptopOrLarger ? 9 : 12}
                                >
                                    <Row>{feedback}</Row>
                                    <Row className="results-container-row">
                                        {results}
                                    </Row>
                                    <Row>
                                        <ul
                                            aria-labelledby="test-toolbar-heading"
                                            className="test-run-toolbar mt-1"
                                        >
                                            <li>
                                                <Button
                                                    variant="secondary"
                                                    onClick={
                                                        handlePreviousTestClick
                                                    }
                                                    disabled={isFirstTest}
                                                >
                                                    Previous Test
                                                </Button>
                                            </li>
                                            <li>
                                                <Button
                                                    ref={nextButtonRef}
                                                    variant="primary"
                                                    onClick={
                                                        handleNextTestClick
                                                    }
                                                    disabled={isLastTest}
                                                >
                                                    Next Test
                                                </Button>
                                            </li>
                                            <li>
                                                <Button
                                                    ref={finishButtonRef}
                                                    variant="primary"
                                                    onClick={() => {
                                                        setFeedbackModalShowing(
                                                            true
                                                        );
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
                                    className={`current-test-options ${
                                        feedback ? 'options-feedback' : ''
                                    }`}
                                    md={isLaptopOrLarger ? 3 : 8}
                                >
                                    <div role="complementary">
                                        <h2 id="test-options-heading">
                                            Test Review Options
                                        </h2>
                                        <ul
                                            className="options-wrapper"
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
                                            <li>
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
            {feedbackModalShowing ? (
                <ProvideFeedbackModal
                    at={at}
                    show={true}
                    username={data.me.username}
                    testPlan={testPlanVersion.title}
                    feedbackIssues={testPlanReport.issues?.filter(
                        issue =>
                            issue.isCandidateReview &&
                            issue.feedbackType === 'FEEDBACK' &&
                            issue.author == data.me.username
                    )}
                    feedbackGithubUrl={feedbackGithubUrl}
                    changesRequestedIssues={testPlanReport.issues?.filter(
                        issue =>
                            issue.isCandidateReview &&
                            issue.feedbackType === 'CHANGES_REQUESTED' &&
                            issue.author == data.me.username
                    )}
                    changesRequestedGithubUrl={changesRequestedGithubUrl}
                    handleAction={submitApproval}
                    handleHide={() => setFeedbackModalShowing(false)}
                />
            ) : (
                <></>
            )}
            {thankYouModalShowing ? (
                <ThankYouModal
                    show={true}
                    handleAction={async () => {
                        setThankYouModalShowing(false);
                        navigate('/candidate-review');
                    }}
                    githubUrl={generalFeedbackUrl}
                />
            ) : (
                <></>
            )}
        </Container>
    );
};

export default CandidateTestPlanRun;
