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
    tests = [],
    conflicts = {},
    currentTestIndex = 0,
    toggleShowClick = () => {},
    handleTestClick = () => {}
}) => {
    return (
        <Col className="test-navigator" md={show ? 3 : 12}>
            {show && <h2>Test Navigator</h2>}
            <div className="test-navigator-toggle-container">
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
            {show && (
                <nav role="complementary">
                    <ol className="test-navigator-list">
                        {tests.map(test => {
                            let resultClassName = 'not-started';
                            let resultStatus = 'Not Started:';

                            const testConflicts = conflicts[test.index] || [];

                            if (test) {
                                if (test.isSkipped) {
                                    resultClassName = 'in-progress';
                                    resultStatus = 'In Progress:';
                                } else if (testConflicts.length) {
                                    resultClassName = 'conflicts';
                                    resultStatus = 'Has Conflicts:';
                                } else if (test.isComplete) {
                                    resultClassName = 'complete';
                                    resultStatus = 'Complete Test:';
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
                                        aria-label={`${resultStatus} ${test.title}`}
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
    tests: PropTypes.array,
    conflicts: PropTypes.object,
    currentTestIndex: PropTypes.number,
    toggleShowClick: PropTypes.func,
    handleTestClick: PropTypes.func
};

export default TestNavigator;
