import React, { useState } from 'react';
import BasicModal from '../../BasicModal';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
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
    const [selectedRadio, setSelectedRadio] = useState(null);
    const [feedbackBody, setFeedbackBody] = useState('');

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
                                    name="radio-feedback"
                                    id="approve-input"
                                    type="radio"
                                />
                                <FormCheck.Label htmlFor="approve-input">
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            color="green"
                                        />{' '}
                                        Approve
                                    </div>
                                </FormCheck.Label>
                                <Form.Text className="radio-text">
                                    {' '}
                                    Submit feedback and approve this Test Plan
                                </Form.Text>
                            </FormCheck>
                            <FormCheck>
                                <FormCheck.Input
                                    id="feedback-input"
                                    name="radio-feedback"
                                    type="radio"
                                />
                                <FormCheck.Label htmlFor="feedback-input">
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faCommentAlt}
                                            color="#B254F8"
                                        />{' '}
                                        Leave More Feedback
                                    </div>
                                </FormCheck.Label>
                                <Form.Text className="radio-text">
                                    Submit general feedback without explicit
                                    approval of this Test Plan
                                </Form.Text>
                            </FormCheck>
                        </Form.Group>
                        <Form.Group>
                            <Form.Control
                                className="feedback-text"
                                as="textarea"
                                rows={5}
                                onChange={e => setFeedbackBody(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </div>
            }
            dialogClassName="feedback"
            handleAction={() => {
                handleAction({
                    status:
                        selectedRadio === 'approve-input'
                            ? 'APPROVED'
                            : 'FEEDBACK',
                    body: feedbackBody
                });
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
