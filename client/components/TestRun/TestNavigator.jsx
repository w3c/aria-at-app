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
import '@fortawesome/fontawesome-svg-core/styles.css';

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
    testPlanRun = null
}) => {
    const isBotCompletedTest = testPlanRun?.tester?.isBot;

    const {
        state: { collectionJob }
    } = useContext(CollectionJobContext);
    const testStatus = useMemo(
        () => collectionJob?.testStatus ?? [],
        [collectionJob]
    );

    return (
        <Col className="test-navigator" md={show ? 3 : 12}>
            <div className="test-navigator-toggle-container">
                <h2
                    id="test-navigator-heading"
                    className="test-navigator-toggle-inner-container"
                >
                    <button
                        aria-label="Test Navigation"
                        aria-controls="test-navigator-nav"
                        aria-expanded={show ? 'true' : 'false'}
                        onClick={toggleShowClick}
                        className="test-navigator-toggle"
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
                    className="test-navigator-list"
                >
                    {tests.map(test => {
                        let resultClassName = 'not-started';
                        let resultStatus = 'Not Started';

                        const issuesExist = testPlanReport.issues?.filter(
                            issue =>
                                issue.isCandidateReview &&
                                issue.testNumberFilteredByAt == test.seq
                        ).length;

                        if (test) {
                            if (isBotCompletedTest) {
                                const { status } =
                                    testStatus.find(
                                        ts => ts.test.id === test.id
                                    ) ?? {};
                                if (status === 'COMPLETED') {
                                    resultClassName = 'bot-complete';
                                    resultStatus = 'Completed by Bot';
                                } else if (status === 'QUEUED') {
                                    resultClassName = 'bot-queued';
                                    resultStatus = 'Queued by Bot';
                                } else if (status === 'RUNNING') {
                                    resultClassName = 'bot-running';
                                    resultStatus = 'Running with Bot';
                                } else if (status === 'ERROR') {
                                    resultClassName = 'bot-error';
                                    resultStatus = 'Error collecting with Bot';
                                } else if (status === 'CANCELLED') {
                                    resultClassName = 'bot-cancelled';
                                    resultStatus = 'Cancelled by Bot';
                                }
                            } else {
                                // Non-bot tests
                                if (test.hasConflicts) {
                                    resultClassName = 'conflicts';
                                    resultStatus = 'Has Conflicts';
                                } else if (test.testResult) {
                                    resultClassName = test.testResult
                                        .completedAt
                                        ? 'complete'
                                        : 'in-progress';
                                    resultStatus = test.testResult.completedAt
                                        ? 'Complete Test'
                                        : 'In Progress';
                                } else if (
                                    !isSignedIn &&
                                    !isVendor &&
                                    test.index === currentTestIndex
                                ) {
                                    resultClassName = 'in-progress';
                                    resultStatus = 'In Progress:';
                                } else if (isVendor) {
                                    if (issuesExist) {
                                        resultClassName = 'changes-requested';
                                        resultStatus = 'Changes Requested';
                                    } else if (viewedTests.includes(test.id)) {
                                        resultClassName = 'complete';
                                        resultStatus = 'Test Viewed';
                                    }
                                }
                            }
                        }
                        return (
                            <li
                                className={`test-name-wrapper ${resultClassName}`}
                                key={`TestNavigatorItem_${test.id}`}
                            >
                                <a
                                    href="#"
                                    onClick={async () =>
                                        await handleTestClick(test.index)
                                    }
                                    className="test-name"
                                    aria-current={
                                        test.index === currentTestIndex
                                    }
                                >
                                    {test.title}
                                </a>
                                <span
                                    className="progress-indicator"
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
    testPlanRun: PropTypes.object
};

export default TestNavigator;
