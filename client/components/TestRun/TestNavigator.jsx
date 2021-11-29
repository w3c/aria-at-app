import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAlignLeft,
    faArrowLeft,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Col } from 'react-bootstrap';
import React from 'react';

const TestNavigator = ({
    show = true,
    isSignedIn = false,
    tests = [],
    currentTestIndex = 0,
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
                {show && <h2 id="test-navigator-heading">Test Navigation</h2>}
            </div>
            {show && (
                <nav aria-label="Test">
                    <ol
                        aria-labelledby="test-navigator-heading"
                        className="test-navigator-list"
                    >
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
    toggleShowClick: PropTypes.func,
    handleTestClick: PropTypes.func
};

export default TestNavigator;
