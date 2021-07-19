import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const CurrentGitCommit = ({
    label,
    gitHash = 'N/A',
    gitCommitMessage = 'Git Commit Message N/A'
}) => {
    return (
        <Form.Group className="current-commit" controlId="testVersion">
            <Form.Label data-test="configure-run-current-commit-label">
                {label}
            </Form.Label>
            <p>
                <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                {`${gitHash.slice(0, 7)} - ${gitCommitMessage.slice(0, 80)}...`}
            </p>
        </Form.Group>
    );
};

CurrentGitCommit.propTypes = {
    label: PropTypes.string,
    gitHash: PropTypes.string,
    gitCommitMessage: PropTypes.string
};

export default CurrentGitCommit;
