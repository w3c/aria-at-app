import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import nextId from 'react-id-generator';

const StatusBar = ({
    issues = [],
    conflicts = [],
    handleRaiseIssueButtonClick = () => {},
    handleReviewConflictsButtonClick = () => {}
}) => {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const statuses = [];

        if (issues.length) {
            // TODO: Replace with a loader to prevent flickers
            const variant = 'warning';
            const action = (
                <Button
                    className="ml-auto"
                    variant={variant}
                    onClick={handleRaiseIssueButtonClick}
                >
                    Review Issues
                </Button>
            );
            const icon = 'alert';
            const message = 'This test has open issues';
            statuses.push({
                action,
                icon,
                message,
                variant
            });
        }

        if (conflicts.length) {
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
    conflicts: PropTypes.array,
    handleRaiseIssueButtonClick: PropTypes.func,
    handleReviewConflictsButtonClick: PropTypes.func
};

export default StatusBar;
