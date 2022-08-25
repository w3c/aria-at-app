import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import TestNavigator from '../TestRun/TestNavigator';
import TestRenderer from '../TestRenderer';
import OptionButton from '../TestRun/OptionButton';
import { navigateTests } from '../../utils/navigateTests';
import { CANDIDATE_REPORTS_QUERY } from './queries';
import { Container, Row, Col, Button } from 'react-bootstrap';
import nextId from 'react-id-generator';
import '../TestRun/TestRun.css';
import '../App/App.css';

const CandidateTestPlanRun = ({
    atId = null,
    testPlanVersionId = null,
    githubIssues = null
}) => {
    const { loading, data, error } = useQuery(CANDIDATE_REPORTS_QUERY);
    const testRunStateRef = useRef();
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showTestNavigator, setShowTestNavigator] = useState(true);
    const [isFirstTest, setIsFirstTest] = useState(true);
    const [isLastTest, setIsLastTest] = useState(false);

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);
    const handleTestClick = index => {
        setCurrentTestIndex(index);
    };
    const handleNextTestClick = () => {
        navigateTests(
            false,
            currentTest,
            tests,
            setCurrentTestIndex,
            setIsFirstTest,
            setIsLastTest
        );
    };
    const handlePreviousTestClick = () => {
        navigateTests(
            true,
            currentTest,
            tests,
            setCurrentTestIndex,
            setIsFirstTest,
            setIsLastTest
        );
    };

    const setup = () => {
        testRunStateRef.current = null;
        recentTestRunStateRef.current = null;
        testRunResultRef.current = null;
    };

    useEffect(() => setup());

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error</p>;
    if (!data) return null;

    const testPlanReports = data.testPlanReports.filter(
        report =>
            report.at.id === atId &&
            report.testPlanVersion.id == testPlanVersionId
    );

    const tests = testPlanReports[0].runnableTests.map((test, index) => ({
        ...test,
        index,
        seq: index + 1
    }));
    const currentTest = tests[currentTestIndex];
    const testPlanVersion = testPlanReports[0].testPlanVersion;

    return (
        <Container className="test-run-container">
            <Row>
                <TestNavigator
                    isVendor={true}
                    show={showTestNavigator}
                    tests={tests}
                    currentTestIndex={currentTestIndex}
                    toggleShowClick={toggleTestNavigator}
                    handleTestClick={handleTestClick}
                />
                <Col>
                    <h1>
                        <span className="task-label">
                            Reviewing tests {currentTest.seq} of {tests.length}:
                        </span>
                        {`${currentTest.seq}.`} {currentTest.title}
                    </h1>
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
                                <b>Review status by JAWS Representative:</b> In
                                Progress
                            </div>
                        </div>
                        <div className="test-info-entity target-date">
                            <div className="info-label">
                                <b>Target Completion Date:</b>
                                December 31, 2022
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col>
                            {githubIssues && (
                                <Row>
                                    <h2>Feedback from JAWS Representative</h2>
                                    <ul>
                                        <li key={nextId()}>
                                            {githubIssues.changes?.length}{' '}
                                            {githubIssues.changes?.length === 1
                                                ? 'person'
                                                : 'people'}{' '}
                                            requested changes for this test
                                        </li>
                                        <li key={nextId()}>
                                            {githubIssues.feedback?.length}{' '}
                                            {githubIssues.feedback?.length === 1
                                                ? 'person'
                                                : 'people'}{' '}
                                            left feedback for this test
                                        </li>
                                    </ul>
                                </Row>
                            )}

                            <Row>
                                {testPlanReports.map(testPlanReport => {
                                    return (
                                        <div key={nextId()}>
                                            <h1>
                                                {testPlanReport.browser.name}
                                            </h1>
                                            <TestRenderer
                                                key={`${testPlanReport.id} + ${testPlanReport.finalizedTestResults[currentTestIndex].id}`}
                                                at={testPlanReport.at}
                                                testRunStateRef={
                                                    testRunStateRef
                                                }
                                                recentTestRunStateRef={
                                                    recentTestRunStateRef
                                                }
                                                setIsRendererReady={() => {}}
                                                testResult={
                                                    testPlanReport
                                                        .finalizedTestResults[
                                                        currentTestIndex
                                                    ]
                                                }
                                                testPageUrl={
                                                    testPlanReport
                                                        .testPlanVersion
                                                        .testPageUrl
                                                }
                                                testRunResultRef={
                                                    testRunResultRef
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </Row>
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

CandidateTestPlanRun.propTypes = {
    atId: PropTypes.string,
    testPlanVersionId: PropTypes.string,
    githubIssues: PropTypes.object
};

export default CandidateTestPlanRun;
