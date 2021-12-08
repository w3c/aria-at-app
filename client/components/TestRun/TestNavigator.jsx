import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAlignLeft,
    faArrowLeft,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Col, Overlay, Tooltip } from 'react-bootstrap';
import React, { useRef, useState } from 'react';

const TestNavigator = ({
    show = true,
    isSignedIn = false,
    tests = [],
    currentTestIndex = 0,
    testPlanRunId = 0,
    toggleShowClick = () => {},
    handleTestClick = () => {}
}) => {
    return (
        <Col className="test-navigator" md={show ? 3 : 12}>
            <div className="test-navigator-toggle-container">
                <div className="test-navigator-toggle-inner-container">
                    <button
                        aria-label={`${
                            show
                                ? 'Toggle button to close test navigator'
                                : 'Toggle button to open test navigator'
                        }`}
                        onClick={toggleShowClick}
                        className={`test-navigator-toggle ${
                            show ? 'hide' : 'show'
                        }`}
                    >
                        {show ? (
                            <FontAwesomeIcon icon={faArrowLeft} />
                        ) : (
                            <FontAwesomeIcon icon={faArrowRight} />
                        )}
                        <FontAwesomeIcon icon={faAlignLeft} />
                    </button>
                </div>
                {show && <h2>Test Navigator</h2>}
            </div>
            {show && (
                <nav role="complementary">
                    <ol className="test-navigator-list">
                        {tests.map(test => {
                            let resultClassName = 'not-started';
                            let resultStatus = 'Not Started';

                            if (test) {
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
                                    test.index === currentTestIndex
                                ) {
                                    resultClassName = 'in-progress';
                                    resultStatus = 'In Progress:';
                                }
                            }

                            const [show, setShow] = useState(false);
                            const target = useRef(null);

                            return (
                                <li
                                    className={`test-name-wrapper ${resultClassName}`}
                                    key={`TestNavigatorItem_${test.id}`}
                                >
                                    <a
                                        ref={target}
                                        href={`/run/${testPlanRunId}/task/${test.index +
                                            1}`}
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
                                    </a>
                                    <span
                                        aria-hidden="true"
                                        className="progress-indicator"
                                    />
                                    <Overlay
                                        target={target.current}
                                        show={show}
                                        placement="top-end"
                                    >
                                        {props => (
                                            <Tooltip {...props}>
                                                {resultStatus}
                                            </Tooltip>
                                        )}
                                    </Overlay>
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            )}
        </Col>
    );
};

TestNavigator.propTypes = {
    show: PropTypes.bool,
    isSignedIn: PropTypes.bool,
    tests: PropTypes.array,
    testResult: PropTypes.object,
    conflicts: PropTypes.object,
    currentTestIndex: PropTypes.number,
    testPlanRunId: PropTypes.number,
    toggleShowClick: PropTypes.func,
    handleTestClick: PropTypes.func
};

export default TestNavigator;
