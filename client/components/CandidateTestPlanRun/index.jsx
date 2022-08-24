import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import TestNavigator from '../TestRun/TestNavigator';
import TestRenderer from '../TestRenderer';
import OptionButton from '../TestRun/OptionButton';
import { CANDIDATE_REPORTS_QUERY } from './queries';
import { Container, Row, Col } from 'react-bootstrap';
import '../TestRun/TestRun.css';

const CandidateTestPlanRun = ({ atId = null, testPlanVersionId = null }) => {
    const { loading, data, error } = useQuery(CANDIDATE_REPORTS_QUERY);
    const testRunStateRef = useRef();
    const recentTestRunStateRef = useRef();
    const testRunResultRef = useRef();
    const [isRendererReady, setIsRendererReady] = useState(false);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [showTestNavigator, setShowTestNavigator] = useState(true);

    const toggleTestNavigator = () => setShowTestNavigator(!showTestNavigator);
    const handleTestClick = async index => setCurrentTestIndex(index);

    const setup = () => {
        testRunStateRef.current = null;
        recentTestRunStateRef.current = null;
        testRunResultRef.current = null;
        setIsRendererReady(false);
    };

    useEffect(() => setup());

    if (loading) return <p>Loading...</p>;
    if (!data) return null;

    const testPlanReports = data.testPlanReports.filter(
        report =>
            report.at.id === atId &&
            report.testPlanVersion.id == testPlanVersionId
    );

    const currentTest = testPlanReports[0].runnableTests[currentTestIndex];
    const testPlanVersion = testPlanReports[0].testPlanVersion;

    return (
        <Container className="test-run-container">
            <Row>
                <TestNavigator
                    show={showTestNavigator}
                    tests={testPlanReports[0].runnableTests}
                    currentTestIndex={currentTestIndex}
                    toggleShowClick={toggleTestNavigator}
                    handleTestClick={handleTestClick}
                />
                <Col>
                    <h1>
                        <span className="task-label">
                            Reviewing tests {currentTestIndex} of{' '}
                            {testPlanReports[0].runnableTests.length}:
                        </span>
                        {`${currentTestIndex + 1}.`} {currentTest.title}
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
                            {testPlanReports.map(testPlanReport => {
                                return (
                                    <>
                                        <h1>{testPlanReport.browser.name}</h1>
                                        <TestRenderer
                                            key={testPlanReport.id}
                                            at={testPlanReport.at}
                                            testRunStateRef={testRunStateRef}
                                            recentTestRunStateRef={
                                                recentTestRunStateRef
                                            }
                                            setIsRendererReady={
                                                setIsRendererReady
                                            }
                                            testResult={
                                                testPlanReport
                                                    .finalizedTestResults[0]
                                            }
                                            testPageUrl={
                                                testPlanReport.testPlanVersion
                                                    .testPageUrl
                                            }
                                            testRunResultRef={testRunResultRef}
                                        />
                                    </>
                                );
                            })}
                        </Col>
                        <Col>
                            <Col className="current-test-options" md={3}>
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
    testPlanVersionId: PropTypes.string
};

export default CandidateTestPlanRun;
