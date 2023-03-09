import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import nextId from 'react-id-generator';

const StatusBar = ({
    hasConflicts = false,
    hasIncompleteTestRuns = false,
    isCandidateTestRun = false,
    handleReviewConflictsButtonClick = () => {}
}) => {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const statuses = [];

        if (hasConflicts) {
            const variant = 'warning';
            const action = (
                <Button
                    className="ml-auto"
                    variant={variant}
                    onClick={handleReviewConflictsButtonClick}
                >
                    Review Conflicts
                </Button>
            );
            const icon = 'alert';
            const message = 'This test has conflicting results';
            statuses.push({
                action,
                icon,
                message,
                variant
            });
        }

        if(hasIncompleteTestRuns && isCandidateTestRun) {
            const variant = 'warning';
            const icon = 'alert';
            const message = 'This Candidate Test Plan has incomplete test results and cannot be finished. Please move this Test Plan back to Draft and complete recording all test results.';
            statuses.push({
                icon,
                message,
                variant
            });
        }

        setStatuses(statuses);
    }, []);

    return (
        <>
            {statuses.map(({ action, icon, message, variant }) => {
                return (
                    <Alert
                        key={nextId()}
                        variant={variant}
                        className="status-bar"
                    >
                        <Octicon icon={Octicons[icon]} className="mr-2" />{' '}
                        {message}
                        {action}
                    </Alert>
                );
            })}
        </>
    );
};

StatusBar.propTypes = {
    issues: PropTypes.array,
    hasConflicts: PropTypes.bool,
    hasIncompleteTestRuns: PropTypes.bool,
    isCandidateTestRun: PropTypes.bool,
    handleReviewConflictsButtonClick: PropTypes.func
};

export default StatusBar;
