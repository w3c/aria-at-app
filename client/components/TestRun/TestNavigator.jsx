import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAlignLeft,
    faArrowLeft,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Col } from 'react-bootstrap';
import React from 'react';
import '@fortawesome/fontawesome-svg-core/styles.css';

const TestNavigator = ({
    show = true,
    isSignedIn = false,
    currentUser = {},
    isVendor = false,
    testPlanReports = [],
    tests = [],
    currentTestIndex = 0,
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
                        const issuesExist = testPlanReports[
                            test.index
                        ]?.issues?.filter(
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
                                } else if (
                                    test.viewers.find(
                                        each =>
                                            each.username ===
                                            currentUser.username
                                    )
                                ) {
                                    resultClassName = 'complete';
                                    resultStatus = 'Test Viewed';
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
    testPlanReports: PropTypes.array,
    tests: PropTypes.array,
    testResult: PropTypes.object,
    conflicts: PropTypes.object,
    currentTestIndex: PropTypes.number,
    currentUser: PropTypes.object,
    viewed: PropTypes.bool,
    toggleShowClick: PropTypes.func,
    handleTestClick: PropTypes.func
};

export default TestNavigator;
