import React, { useRef } from 'react';
import BasicModal from '../../BasicModal';
import PropTypes, { element } from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faCommentAlt,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Form, FormCheck } from 'react-bootstrap';
import './ProvideFeedbackModal.css';

const ProvideFeedbackModal = ({
    at = '',
    handleAction = () => {},
    issues = [],
    show = false,
    testPlan = '',
    username = ''
}) => {
    const radioRef = useRef();
    const changeRadio = element => {
        console.log(element.target.checked);
    };

    return (
        <BasicModal
            show={show}
            actionLabel={'Submit'}
            centered={true}
            closeButton={false}
            content={
                <div>
                    <p>
                        You have raised{' '}
                        <a href="javascript:void(0)">
                            {issues.length}{' '}
                            {issues.length > 1 ? 'issue' : 'issues'}
                        </a>{' '}
                        for this test plan.
                    </p>
                    <h2>Finish Your Review</h2>
                    <Form>
                        <FormCheck>
                            <FormCheck.Input
                                name="radio-feedback"
                                type="radio"
                            />
                            <FormCheck.Label>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        color="green"
                                    />{' '}
                                    Approve
                                </div>
                            </FormCheck.Label>
                            <Form.Text>
                                {' '}
                                Approve without providing feedback or change
                                requests
                            </Form.Text>
                        </FormCheck>
                        <FormCheck>
                            <FormCheck.Input
                                name="radio-feedback"
                                type="radio"
                            />
                            <FormCheck.Label>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faCommentAlt}
                                        color="#275CAA"
                                    />{' '}
                                    Provide Feedback
                                </div>
                            </FormCheck.Label>
                            <Form.Text>
                                Provide feedback without explicit approval
                            </Form.Text>
                        </FormCheck>
                        <FormCheck>
                            <FormCheck.Input
                                name="radio-feedback"
                                type="radio"
                            />
                            <FormCheck.Label>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        color="red"
                                    />{' '}
                                    Request Changes
                                </div>
                            </FormCheck.Label>
                            <Form.Text>
                                Request Changes that must be addressed before
                                approving
                            </Form.Text>
                        </FormCheck>
                        <Form.Group>
                            <Form.Control type="textarea" />
                        </Form.Group>
                    </Form>
                </div>
            }
            dialogClassName="modal-90w"
            handleAction={handleAction}
            title={
                <h1 className="feedback-h1">
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
