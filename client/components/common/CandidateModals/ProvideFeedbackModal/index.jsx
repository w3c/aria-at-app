import React, { useState } from 'react';
import BasicModal from '../../BasicModal';
import PropTypes from 'prop-types';
import { Form, FormCheck } from 'react-bootstrap';
import '../common.css';
import './ProvideFeedbackModal.css';
import FeedbackListItem from '../../FeedbackListItem';

const ProvideFeedbackModal = ({
    at = '',
    handleAction = () => {},
    handleHide = () => {},
    feedbackIssues = [],
    changesRequestedIssues = [],
    testPlan = '',
    username = ''
}) => {
    const [selectedRadio, setSelectedRadio] = useState('not-approved-input');

    const uniqueFeedbackAuthors = [
        ...new Set(feedbackIssues.map(issue => issue.author))
    ];

    const uniqueChangeRequestedAuthors = [
        ...new Set(changesRequestedIssues.map(issue => issue.author))
    ];

    return (
        <BasicModal
            show={true}
            actionLabel={'Submit Review'}
            centered={true}
            cancelButton={false}
            handleHide={handleHide}
            content={
                <div className="feedback-content">
                    {changesRequestedIssues.length > 0 && (
                        <FeedbackListItem
                            type="changes-requested"
                            differentAuthors={
                                !(
                                    uniqueChangeRequestedAuthors.length === 1 &&
                                    uniqueChangeRequestedAuthors[0] === username
                                )
                            }
                            issues={changesRequestedIssues}
                        ></FeedbackListItem>
                    )}
                    {feedbackIssues.length > 0 && (
                        <FeedbackListItem
                            type="feedback"
                            differentAuthors={
                                !(
                                    uniqueFeedbackAuthors.length === 1 &&
                                    uniqueFeedbackAuthors[0] === username
                                )
                            }
                            issues={feedbackIssues}
                        ></FeedbackListItem>
                    )}

                    <h2 className="feedback-h2">Finish Your Review</h2>
                    <Form>
                        <Form.Group
                            onChange={e => setSelectedRadio(e.target.id)}
                        >
                            <FormCheck>
                                <FormCheck.Input
                                    id="not-approved-input"
                                    name="radio-feedback"
                                    type="radio"
                                    checked={
                                        selectedRadio === 'not-approved-input'
                                    }
                                />
                                <FormCheck.Label htmlFor="not-approved-input">
                                    Not Approved Yet
                                </FormCheck.Label>
                                <Form.Text className="radio-text">
                                    Submit your Review without explicit approval
                                </Form.Text>
                            </FormCheck>
                            <FormCheck>
                                <FormCheck.Input
                                    name="radio-feedback"
                                    id="approve-input"
                                    type="radio"
                                />
                                <FormCheck.Label htmlFor="approve-input">
                                    Approve
                                </FormCheck.Label>
                                <Form.Text className="radio-text">
                                    {' '}
                                    Submit feedback and approve this Test Plan
                                </Form.Text>
                            </FormCheck>
                        </Form.Group>
                    </Form>
                </div>
            }
            dialogClassName="feedback"
            handleAction={() => {
                handleAction(
                    selectedRadio === 'approve-input' ? 'APPROVED' : ''
                );
            }}
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
    handleHide: PropTypes.func,
    changesRequestedIssues: PropTypes.array,
    feedbackIssues: PropTypes.array,
    show: PropTypes.bool,
    testPlan: PropTypes.string,
    username: PropTypes.string
};

export default ProvideFeedbackModal;
