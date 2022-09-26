import React from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import './FeedbackListItem.css';

const FeedbackListItem = ({
    differentAuthors = false,
    type = 'feedback',
    issues = []
}) => {
    return (
        <li className="feedback-list-item" key={nextId()}>
            {type === 'feedback' ? (
                <FontAwesomeIcon icon={faCommentAlt} color="#B254F8" />
            ) : (
                <FontAwesomeIcon icon={faFlag} color="#F87F1C" />
            )}
            {'  '}
            {!differentAuthors ? (
                <span>
                    {`You ${
                        type === 'feedback'
                            ? 'left feedback for'
                            : 'requested changes for'
                    }
                    `}
                    <a href="#">{issues.length} tests</a> in this Test Plan
                </span>
            ) : (
                <a href="#">
                    {issues.length} {issues.length === 1 ? 'person' : 'people'}{' '}
                    {type === 'feedback'
                        ? 'left feedback'
                        : 'requested changes'}
                    {' for this test'}
                </a>
            )}
            <span className="feedback-indicator" title="Feedback Indicator" />
        </li>
    );
};

FeedbackListItem.propTypes = {
    differentAuthors: PropTypes.bool,
    issues: PropTypes.array,
    type: PropTypes.string
};

export default FeedbackListItem;
