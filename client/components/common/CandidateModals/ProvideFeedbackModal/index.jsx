import React from 'react';
import BasicModal from '../../BasicModal';
import PropTypes from 'prop-types';

const ProvideFeedbackModal = ({
    at = '',
    handleAction = () => {},
    issues = [],
    show = false,
    testPlan = '',
    username = ''
}) => {
    return (
        <BasicModal
            show={show}
            actionLabel={'Submit'}
            centered={true}
            closeButton={false}
            content={
                <div>
                    <p>
                        You have raised {issues.length}{' '}
                        {issues.length > 1 ? 'issue' : 'issues'} for this test
                        plan.
                    </p>
                    <h2>Finish Your Review</h2>
                    <ul>
                        <li>Approve</li>
                        <li>Provide Feedback</li>
                        <li>Request Changes</li>
                    </ul>
                    <textarea></textarea>
                </div>
            }
            handleAction={handleAction}
            title={
                <h1>
                    Great, {username}! You have reviewed every test in the{' '}
                    {testPlan} with {at}
                </h1>
            }
        />
    );
};

ProvideFeedbackModal.propTypes = {
    at: PropTypes.string,
    handleAction: PropTypes.func,
    issues: PropTypes.array,
    show: PropTypes.bool,
    testPlan: PropTypes.string,
    username: PropTypes.string
};

export default ProvideFeedbackModal;
