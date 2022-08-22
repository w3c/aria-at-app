import React, { useState } from 'react';
import BasicModal from '../../BasicModal';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faCommentAlt,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Form, FormCheck } from 'react-bootstrap';
import '../common.css';
import './ProvideFeedbackModal.css';

const ProvideFeedbackModal = ({
    at = '',
    handleAction = () => {},
    issues = [],
    show = false,
    testPlan = '',
    username = ''
}) => {
    const [approveInputDisabled, setApproveInputDisabled] = useState('');
    const [feedbackInputDisabled, setFeedbackInputDisabled] = useState('');
    const [changesInputDisabled, setChangesInputDisabled] = useState('');

    const radioChange = element => {
        switch (element.target.id) {
            case 'approve-input':
                setApproveInputDisabled('');
                setFeedbackInputDisabled('disabled');
                setChangesInputDisabled('disabled');
                break;
            case 'feedback-input':
                setApproveInputDisabled('disabled');
                setFeedbackInputDisabled('');
                setChangesInputDisabled('disabled');
                break;
            case 'changes-input':
                setApproveInputDisabled('disabled');
                setFeedbackInputDisabled('disabled');
                setChangesInputDisabled('');
                break;
        }
    };

    return (
        <BasicModal
            show={show}
            actionLabel={'Submit Review'}
            centered={true}
            content={
                <div className="feedback-content">
                    {issues.length >= 1 && (
                        <p>
                            You have{' '}
                            <a href="#">
                                raised {issues.length}{' '}
                                {issues.length > 1 ? 'issues' : 'issue'}
                            </a>{' '}
                            for this test plan.
                        </p>
                    )}

                    <h2 className="feedback-h2">Finish Your Review</h2>
                    <Form>
                        <Form.Group>
                            <FormCheck>
                                <FormCheck.Input
                                    name="radio-feedback"
                                    id="approve-input"
                                    type="radio"
                                    onClick={radioChange}
                                    className={approveInputDisabled}
                                />
                                <FormCheck.Label
                                    htmlFor="approve-input"
                                    className={approveInputDisabled}
                                >
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            color="green"
                                        />{' '}
                                        Approve
                                    </div>
                                </FormCheck.Label>
                                <Form.Text
                                    className={`radio-text ${approveInputDisabled}`}
                                >
                                    {' '}
                                    Approve without providing feedback or change
                                    requests
                                </Form.Text>
                            </FormCheck>
                            <FormCheck>
                                <FormCheck.Input
                                    id="feedback-input"
                                    name="radio-feedback"
                                    type="radio"
                                    onClick={radioChange}
                                    className={feedbackInputDisabled}
                                />
                                <FormCheck.Label
                                    htmlFor="feedback-input"
                                    className={feedbackInputDisabled}
                                >
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faCommentAlt}
                                            color="#275CAA"
                                        />{' '}
                                        Provide Feedback
                                    </div>
                                </FormCheck.Label>
                                <Form.Text
                                    className={`radio-text ${feedbackInputDisabled}`}
                                >
                                    Provide feedback without explicit approval
                                </Form.Text>
                            </FormCheck>
                            <FormCheck>
                                <FormCheck.Input
                                    id="changes-input"
                                    name="radio-feedback"
                                    type="radio"
                                    onClick={radioChange}
                                    className={changesInputDisabled}
                                />
                                <FormCheck.Label
                                    htmlFor="changes-input"
                                    className={changesInputDisabled}
                                >
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faTimes}
                                            color="red"
                                        />{' '}
                                        Request Changes
                                    </div>
                                </FormCheck.Label>
                                <Form.Text
                                    className={`radio-text ${changesInputDisabled}`}
                                >
                                    Request Changes that must be addressed
                                    before approving
                                </Form.Text>
                            </FormCheck>
                        </Form.Group>
                        <Form.Group>
                            <Form.Control
                                className="feedback-text"
                                as="textarea"
                                rows={5}
                            />
                        </Form.Group>
                    </Form>
                </div>
            }
            dialogClassName="feedback"
            handleAction={handleAction}
            title={
                <>
                    <p className="sr-only">
                        Great {username}! You have reviewed every test in the{' '}
                        {testPlan} with {at}
                    </p>
                    <div className="feedback-title" aria-hidden="true">
                        <span className="feedback-bold">
                            Great, {username}!
                        </span>{' '}
                        You have reviewed every test in the{' '}
                        <span className="feedback-bold">{testPlan}</span> with{' '}
                        <span className="feedback-bold">{at}</span>
                    </div>
                </>
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
