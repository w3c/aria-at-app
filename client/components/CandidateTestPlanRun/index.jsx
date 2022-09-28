import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import TestNavigator from '../TestRun/TestNavigator';
import TestRenderer from '../TestRenderer';
import OptionButton from '../TestRun/OptionButton';
import PageStatus from '../common/PageStatus';
import { navigateTests } from '../../utils/navigateTests';
import {
    ADD_VIEWER_MUTATION,
    CANDIDATE_REPORTS_QUERY,
    PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION
} from './queries';
import {
    Accordion,
    Badge,
    useAccordionToggle,
    Card,
    Container,
    Row,
    Col,
    Button
} from 'react-bootstrap';
import { useParams, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import nextId from 'react-id-generator';
import './CandidateTestPlanRun.css';
import '../TestRun/TestRun.css';
import '../App/App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faCommentAlt,
    faFlag
} from '@fortawesome/free-solid-svg-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { useMediaQuery } from 'react-responsive';
import { convertDateToString } from '../../utils/formatter';

function useSize(target) {
    const [size, setSize] = React.useState();

    React.useLayoutEffect(() => {
        target && setSize(target.getBoundingClientRect());
    }, [target]);

    // Where the magic happens
    useResizeObserver(target, entry => setSize(entry.contentRect));
    return size;
}

const CandidateTestPlanRun = () => {
    const { testPlanVersionId } = useParams();

    const { loading, data, error, refetch } = useQuery(CANDIDATE_REPORTS_QUERY);
    const [addViewer] = useMutation(ADD_VIEWER_MUTATION);
    const [promoteVendorReviewStatus] = useMutation(
        PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION,
        {
            update(
                cache,
                {
                    data: {
                        testPlanReport: { promoteVendorReviewStatus }
                    }
                }
            ) {
                cache.modify({
                    fields: {
                        testPlanReports(existingTestPlanReports) {
                            const newTestPlanReports = [
                                ...existingTestPlanReports
                            ];
                            const modifiedTestPlanReportIndex = newTestPlanReports.findIndex(
                                each =>
                                    each.id ===
                                    promoteVendorReviewStatus.testPlanReport.id
                            );
                            newTestPlanReports[modifiedTestPlanReportIndex] = {
                                ...newTestPlanReports[
                                    modifiedTestPlanReportIndex
                                ],
                                vendorReviewStatus:
                                    promoteVendorReviewStatus.testPlanReport
                                        .vendorReviewStatus
                            };
                            return newTestPlanReports;
                        }
                    }
                });
            }
        }
    );
    const testRunStateRef = useRef();
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [isFirstTest, setIsFirstTest] = useState(true);
    const [isLastTest, setIsLastTest] = useState(false);
    const [accordionMap, setActiveAccordionMap] = useState(new Map());
    const [testCurrentlyViewed, setTestCurrentlyViewed] = useState(false);

    const [issuesHeading, setissuesHeading] = React.useState();
    const issuesHeadingSize = useSize(issuesHeading);
    const [issuesList, setissuesList] = React.useState();
    const issuesListSize = useSize(issuesList);
    const isLaptopOrLarger = useMediaQuery({
        query: '(min-width: 792px)'
    });

    const addViewerToTest = async testId => {
        await addViewer({ variables: { testPlanVersionId, testId } });
        setTestCurrentlyViewed(true);
    };
    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);
    const handleTestClick = async index => {
        setCurrentTestIndex(index);
        if (testCurrentlyViewed) await refetch();
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
        if (testCurrentlyViewed) await refetch();
    };
    const handlePreviousTestClick = async () => {
        navigateTests(
            true,
            currentTest,
            tests,
            setCurrentTestIndex,
            setIsFirstTest,
            setIsLastTest
        );
        if (testCurrentlyViewed) await refetch();
    };

    const setup = () => {
        testRunStateRef.current = null;
        recentTestRunStateRef.current = null;
        testRunResultRef.current = null;
    };

    useEffect(() => setup());

    const updateTestViewed = async () => {
        if (!userPreviouslyViewedTest) {
            addViewerToTest(currentTest.id);
        } else {
            setTestCurrentlyViewed(true);
        }
    };

    const updateVendorStatus = async () => {
        if (vendorReviewStatus === 'READY') {
            await Promise.all(
                testPlanReports.map(report => {
                    promoteVendorReviewStatus({
                        variables: { testReportId: report.id }
                    });
                })
            );
        }
    };

    useEffect(() => {
        if (data) {
            updateTestViewed();
            updateVendorStatus();
        }
    }, [data, currentTestIndex]);

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

    const toggleAccordion = (accordionMap, index) => {
        if (!accordionMap.get(index)) {
            return new Map(accordionMap.set(index, true));
        }
        return new Map(accordionMap.set(index, false));
    };

    const vendorMap = {
        vispero: 'JAWS',
        nvaccess: 'NVDA',
        apple: 'VoiceOver for macOS'
    };

    const { at, vendorCompany } = data.me.vendor;

    if (vendorMap[vendorCompany] !== at) return <Redirect to="/404" />;

    const testPlanReports = data.testPlanReports.filter(
        report =>
            report.at.name === at &&
            report.testPlanVersion.id == testPlanVersionId
    );

    if (testPlanReports.length === 0) return <Redirect to="/404" />;

    //TODO: figure out if this logic is right
    const tests = testPlanReports[0].runnableTests.map((test, index) => ({
        ...test,
        index,
        seq: index + 1
    }));

    const currentTest = tests[currentTestIndex];
    const {
        testPlanVersion,
        vendorReviewStatus,
        recommendedStatusTargetDate,
        candidateStatusReachedAt
    } = testPlanReports[0];
    const vendorReviewStatusMap = {
        READY: 'Ready',
        IN_PROGRESS: 'In Progress',
        APPROVED: 'Approved'
    };

    const reviewStatus = vendorReviewStatusMap[vendorReviewStatus];

    const userPreviouslyViewedTest = !!currentTest.viewers.find(
        each => each.username === data.me.username
    );

    const targetCompletionDate = convertDateToString(
        new Date(recommendedStatusTargetDate),
        'MMMM D, YYYY'
    );
    const startedAtDate = convertDateToString(
        new Date(candidateStatusReachedAt),
        'MMMM D, YYYY'
    );

    // Assumes that the issues are across the entire AT/Browser combination
    const changesRequestedIssues = testPlanReports[0].issues?.filter(
        issue =>
            issue.feedbackType === 'changes-requested' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );

    const feedbackIssues = testPlanReports[0].issues?.filter(
        issue =>
            issue.feedbackType === 'feedback' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );

    const ContextAwareToggle = ({ children, eventKey, callback }) => {
        const decoratedOnClick = useAccordionToggle(
            eventKey,
            () => callback && callback(eventKey)
        );

        const currentKey = accordionMap.get(eventKey);

        return (
            <div
                onClick={decoratedOnClick}
                className="feedback-accordion-header"
            >
                {children}
                <span className="arrow">
                    <FontAwesomeIcon
                        icon={currentKey ? faAngleUp : faAngleDown}
                    />
                </span>
            </div>
        );
    };

    ContextAwareToggle.propTypes = {
        children: PropTypes.any,
        eventKey: PropTypes.string,
        callback: PropTypes.func
    };

    const heading = (
        <div className="test-info-heading">
            <span className="task-label">
                Reviewing Test {currentTest.seq} of {tests.length}:
            </span>
            <h1>
                {`${currentTest.seq}. ${currentTest.title}`}{' '}
                <span className="using">using</span> {`${at}`}
                {userPreviouslyViewedTest && ' '}
                {userPreviouslyViewedTest && (
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
                    {`${testPlanVersion.title ||
                        testPlanVersion.testPlan?.directory ||
                        ''}`}
                </div>
            </div>
            <div className="test-info-entity review-status">
                <div className="info-label">
                    <b>Review status by {at} Representative:</b>{' '}
                    {`${reviewStatus} `}
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

    const feedback = testPlanReports[0].issues.filter(
        issue => issue.testNumberFilteredByAt == currentTest.seq
    ).length > 0 && (
        <div className="issues-container">
            <h2
                style={{
                    width: isLaptopOrLarger
                        ? issuesHeadingSize?.width
                        : issuesListSize?.width,
                    position: 'relative'
                }}
            >
                <span className="feedback-from-text">Feedback from</span>{' '}
                <b>{at} Representative</b>
            </h2>
            <ul
                className="feedback-list"
                style={{
                    width: issuesListSize?.width,
                    position: 'relative'
                }}
            >
                {[changesRequestedIssues, feedbackIssues].map(
                    (list, index) =>
                        list.length > 0 && (
                            <li className="feedback-list-item" key={nextId()}>
                                {index === 0 ? (
                                    <FontAwesomeIcon
                                        icon={faFlag}
                                        color="#F87F1C"
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faCommentAlt}
                                        color="#B254F8"
                                    />
                                )}
                                {'  '}
                                <a href="#">
                                    {list.length}{' '}
                                    {list.length === 1 ? 'person' : 'people'}{' '}
                                    {index === 0
                                        ? 'requested changes'
                                        : 'left feedback'}{' '}
                                </a>
                                for this test
                                <span
                                    className="feedback-indicator"
                                    title="Title"
                                />
                            </li>
                        )
                )}
            </ul>
        </div>
    );

    const results = (
        <>
            <h1 className="current-test-title">{currentTest.title}</h1>
            <Accordion className="feedback-accordion" defaultActiveKey="0">
                <Card>
                    <Card.Header>
                        <ContextAwareToggle
                            eventKey="0"
                            callback={index => {
                                //TODO separate this
                                setActiveAccordionMap(map =>
                                    toggleAccordion(map, index)
                                );
                            }}
                        >
                            Test Instructions
                        </ContextAwareToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <TestRenderer
                                at={testPlanReports[0].at}
                                testRunStateRef={testRunStateRef}
                                recentTestRunStateRef={recentTestRunStateRef}
                                setIsRendererReady={() => {}}
                                testResult={
                                    testPlanReports[0].finalizedTestResults[
                                        currentTestIndex
                                    ]
                                }
                                testPageUrl={
                                    testPlanReports[0].testPlanVersion
                                        .testPageUrl
                                }
                                testRunResultRef={testRunResultRef}
                                showResultsHeader={false}
                                showResults={false}
                                showInstructions={true}
                            />
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            {testPlanReports.map((testPlanReport, index) => {
                return (
                    <Accordion
                        key={`feedback-accordion-${index + 1}`}
                        className="feedback-accordion"
                        defaultActiveKey={`${index + 1}`}
                    >
                        <Card>
                            <Card.Header>
                                <ContextAwareToggle
                                    eventKey={`${index + 1}`}
                                    callback={index => {
                                        setActiveAccordionMap(map =>
                                            toggleAccordion(map, index)
                                        );
                                    }}
                                >
                                    Test Results for{' '}
                                    {testPlanReport.browser.name}
                                </ContextAwareToggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey={`${index + 1}`}>
                                <Card.Body>
                                    <TestRenderer
                                        key={`${testPlanReport.id} + ${testPlanReport.finalizedTestResults[currentTestIndex].id}`}
                                        at={testPlanReport.at}
                                        testRunStateRef={testRunStateRef}
                                        recentTestRunStateRef={
                                            recentTestRunStateRef
                                        }
                                        setIsRendererReady={() => {}}
                                        testResult={
                                            testPlanReport.finalizedTestResults[
                                                currentTestIndex
                                            ]
                                        }
                                        testPageUrl={
                                            testPlanReport.testPlanVersion
                                                .testPageUrl
                                        }
                                        testRunResultRef={testRunResultRef}
                                        showResultsHeader={false}
                                    />
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                );
            })}
        </>
    );

    const githubAtLabelMap = {
        'VoiceOver for macOS': 'vo',
        JAWS: 'jaws',
        NVDA: 'nvda'
    };
    const githubIssueUrlTitle = `ARIA-AT-App Candidate Test Plan Review for ${at}/${testPlanVersion.title} started ${startedAtDate}`;
    const defaultGithubLabels = 'app,candidate-review';
    const githubUrl = `https://github.com/w3c/aria-at-app/issues/new?title=${encodeURI(
        githubIssueUrlTitle
    )}&labels=${defaultGithubLabels},${githubAtLabelMap[at]}`;
    const requestChangesUrl = `${githubUrl},changes-requested`;
    const feedbackUrl = `${githubUrl},feedback`;
    const fileBugUrl = `${githubUrl},bug`;

    return (
        <Container className="test-run-container">
            <Helmet>
                <title>Candidate Test Run Page | ARIA-AT</title>
            </Helmet>
            <Row>
                <TestNavigator
                    isVendor={true}
                    testPlanReports={testPlanReports}
                    show={showTestNavigator}
                    tests={tests}
                    currentTestIndex={currentTestIndex}
                    toggleShowClick={toggleTestNavigator}
                    handleTestClick={handleTestClick}
                    currentUser={data.me}
                />
                <Col
                    className="candidate-test-area"
                    id="candidate-test-run-main"
                    as="main"
                    tabIndex="-1"
                >
                    <Row>
                        {heading}
                        {testInfo}
                        <Col className="results-container-col">
                            <Row xs={1} s={1} md={2} ref={setissuesHeading}>
                                <Col
                                    className="results-container"
                                    md={isLaptopOrLarger ? 9 : 12}
                                    ref={setissuesList}
                                >
                                    <Row>{feedback}</Row>
                                    <Row className="results-col">{results}</Row>
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
                                                    variant="secondary"
                                                    onClick={
                                                        handleNextTestClick
                                                    }
                                                    disabled={isLastTest}
                                                >
                                                    Next Test
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
        </Container>
    );
};

export default CandidateTestPlanRun;
