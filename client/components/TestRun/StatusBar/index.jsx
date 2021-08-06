import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import nextId from 'react-id-generator';

const StatusBar = ({
    conflicts = [],
    handleReviewConflictsButtonClick = () => {}
}) => {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        // TODO: determine if still need to show issues. Seems to have been unsupported in old version
        if (conflicts.length) {
            const variant = 'warning';
            const action = (
                <Button
                    className="ml-2"
                    variant={variant}
                    onClick={handleReviewConflictsButtonClick}
                >
                    Review Conflicts
                </Button>
            );
            const icon = 'alert';
            const message = 'This test has conflicting results';

            setStatuses([
                ...statuses,
                {
                    action,
                    icon,
                    message,
                    variant
                }
            ]);
        }
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
    conflicts: PropTypes.array,
    handleReviewConflictsButtonClick: PropTypes.func
};

export default StatusBar;
