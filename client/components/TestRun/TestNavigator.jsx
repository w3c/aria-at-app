import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Col, Overlay, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAlignLeft,
    faArrowLeft,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const TestNavigator = ({
    show = true,
    isSignedIn = false,
    viewedTests = [],
    isVendor = false,
    testPlanReport = {},
    tests = [],
    currentTestIndex = 0,
    testPlanRunId = 0,
    toggleShowClick = () => {},
    handleTestClick = () => {}
}) => {
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
                            issue => issue.testNumberFilteredByAt == test.seq
                        ).length;

                        if (test) {
                            if (test.hasConflicts) {
                                resultClassName = 'conflicts';
                                resultStatus = 'Has Conflicts';
                            } else if (test.testResult) {
                                resultClassName = test.testResult.completedAt
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

                            const [show, setShow] = useState(false);
                            const target = useRef(null);

                            return (
                                <li
                                    className={`test-name-wrapper ${resultClassName}`}
                                    key={`TestNavigatorItem_${test.id}`}
                                >
                                    <Link
                                        ref={target}
                                        to={
                                            isSignedIn
                                                ? `/run/${testPlanRunId}/task/${
                                                      test.index + 1
                                                  }`
                                                : `/test-plan-report/${
                                                      testPlanReport.id
                                                  }/task/${test.index + 1}`
                                        }
                                        onClick={async () =>
                                            await handleTestClick(test.index)
                                        }
                                        onBlur={() => setShow(false)}
                                        onFocus={() => setShow(true)}
                                        onMouseLeave={() => setShow(false)}
                                        onMouseEnter={() => setShow(true)}
                                        className="test-name"
                                        aria-current={
                                            test.index === currentTestIndex
                                        }
                                        aria-label={`${test.title} (${resultStatus})`}
                                    >
                                        {test.title}
                                    </Link>
                                    <span
                                        aria-hidden="true"
                                        className="progress-indicator"
                                    />
                                    <Overlay
                                        target={target.current}
                                        show={show}
                                        placement="right"
                                    >
                                        {props => (
                                            <Tooltip {...props}>
                                                {resultStatus}
                                            </Tooltip>
                                        )}
                                    </Overlay>
                                </li>
                            );
                        }
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
    testPlanRunId: PropTypes.number,
    viewedTests: PropTypes.array,
    toggleShowClick: PropTypes.func,
    handleTestClick: PropTypes.func
};

export default TestNavigator;
