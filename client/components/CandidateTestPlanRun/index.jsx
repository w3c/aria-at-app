import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import TestNavigator from '../TestRun/TestNavigator';
import TestRenderer from '../TestRenderer';
import OptionButton from '../TestRun/OptionButton';
import { navigateTests } from '../../utils/navigateTests';
import { ADD_VIEWER_MUTATION, CANDIDATE_REPORTS_QUERY } from './queries';
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
import { useParams, useHistory } from 'react-router-dom';
import nextId from 'react-id-generator';
import './CandidateTestPlanRun.css';
import '../TestRun/TestRun.css';
import '../App/App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const CandidateTestPlanRun = () => {
    const { testPlanVersionId } = useParams();
    const history = useHistory();

    const { loading, data, error, refetch } = useQuery(CANDIDATE_REPORTS_QUERY);
    const [addViewer] = useMutation(ADD_VIEWER_MUTATION);
    const testRunStateRef = useRef();
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [isFirstTest, setIsFirstTest] = useState(true);
    const [isLastTest, setIsLastTest] = useState(false);
    const [activeMap, setActiveMap] = useState(new Map());
    const [testCurrentlyViewed, setTestCurrentlyViewed] = useState(false);

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
        setTestCurrentlyViewed(false);
        if (!userPerviouslyViewedTest) {
            addViewerToTest(currentTest.id);
        } else {
            setTestCurrentlyViewed(true);
        }
    };

    useEffect(() => {
        if (data) {
            updateTestViewed();
        }
    }, [data]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error</p>;
    if (!data) return null;

    const vendorMap = {
        vispero: 'JAWS',
        nvaccess: 'NVDA',
        apple: 'VoiceOver for MacOS'
    };

    const { at, vendorCompany } = data.me.vendor;

    if (vendorMap[vendorCompany] !== at) {
        history.push('/404');
    }

    const testPlanReports = data.testPlanReports.filter(
        report =>
            report.at.name === at &&
            report.testPlanVersion.id == testPlanVersionId
    );

    //TODO: figure out if this logic is right
    const tests = testPlanReports[0].runnableTests.map((test, index) => ({
        ...test,
        index,
        seq: index + 1
    }));

    const currentTest = tests[currentTestIndex];
    const testPlanVersion = testPlanReports[0].testPlanVersion;
    const userPerviouslyViewedTest = !!currentTest.viewers.find(
        each => each.username === data.me.username
    );
    const targetCompletionDate = new Date(
        testPlanReports[0].recommendedStatusTargetDate
    );

    const changesRequestedIssues = testPlanReports[
        currentTestIndex
    ].issues?.filter(
        issue =>
            issue.feedbackType === 'changes-requested' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );
    const feedbackIssues = testPlanReports[currentTestIndex].issues?.filter(
        issue =>
            issue.feedbackType === 'feedback' &&
            issue.testNumberFilteredByAt === currentTest.seq
    );

    const ContextAwareToggle = ({ children, eventKey, callback }) => {
        const decoratedOnClick = useAccordionToggle(
            eventKey,
            () => callback && callback(eventKey)
        );

        const currentKey = activeMap.get(eventKey);

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
                {userPerviouslyViewedTest && ' '}
                {userPerviouslyViewedTest && (
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
                    <b>Review status by {at} Representative:</b> In Progress
                </div>
            </div>
            <div className="test-info-entity target-date">
                <div className="info-label">
                    <b>Target Completion Date: </b>
                    {`${
                        months[targetCompletionDate.getMonth()]
                    } ${targetCompletionDate.getDate()}, ${targetCompletionDate.getFullYear()}`}
                </div>
            </div>
        </div>
    );

    const feedback = testPlanReports[currentTestIndex].issues.filter(
        issue => issue.testNumberFilteredByAt == currentTest.seq
    ).length > 0 && (
        <div>
            <h2>Feedback from {at} Representative</h2>
            <ul className="feedback-list">
                {[changesRequestedIssues, feedbackIssues].map(
                    (list, index) =>
                        list.length > 0 && (
                            <li className="feedback-list-item" key={nextId()}>
                                {list.length}{' '}
                                {list.length === 1 ? 'person' : 'people'}{' '}
                                {index === 0
                                    ? 'requested changes'
                                    : 'left feedback'}{' '}
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
            <h1>{currentTest.title}</h1>
            <Accordion className="feedback-accordion">
                <Card>
                    <Card.Header>
                        <ContextAwareToggle
                            eventKey="0"
                            callback={e => {
                                //TODO separate this
                                setActiveMap(map => {
                                    if (!map.get(e)) {
                                        return new Map(map.set(e, true));
                                    }
                                    return new Map(map.set(e, false));
                                });
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
                    >
                        <Card>
                            <Card.Header>
                                <ContextAwareToggle
                                    eventKey={`${index + 1}`}
                                    callback={e => {
                                        setActiveMap(map => {
                                            if (!map.get(e)) {
                                                return new Map(
                                                    map.set(e, true)
                                                );
                                            }
                                            return new Map(map.set(e, false));
                                        });
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

    return (
        <Container className="test-run-container">
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
                        {feedback}
                    </Row>
                    <Row xs={1} s={1} md={2}>
                        <Col>
                            <Row className="results-col">{results}</Row>
                            <Row>
                                <ul
                                    aria-labelledby="test-toolbar-heading"
                                    className="test-run-toolbar mt-1"
                                >
                                    <li>
                                        <Button
                                            variant="secondary"
                                            onClick={handlePreviousTestClick}
                                            disabled={isFirstTest}
                                        >
                                            Previous Test
                                        </Button>
                                    </li>
                                    <li>
                                        <Button
                                            variant="secondary"
                                            onClick={handleNextTestClick}
                                            disabled={isLastTest}
                                        >
                                            Next Test
                                        </Button>
                                    </li>
                                </ul>
                            </Row>
                        </Col>
                        <Col>
                            <Col className="current-test-options" md={4}>
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
                                                href="#"
                                            />
                                        </li>
                                        <li>
                                            <OptionButton text="Leave Feedback" />
                                        </li>
                                        <li>
                                            <OptionButton text="File an AT bug" />
                                        </li>
                                    </ul>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default CandidateTestPlanRun;
