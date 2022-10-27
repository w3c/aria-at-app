import React from 'react';
import BasicModal from '../../BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import '../common.css';
import './ThankYouModal.css';

const ThankYouModal = ({ handleAction = () => {}, githubUrl = '#' }) => {
    return (
        <BasicModal
            show={true}
            actionLabel={'Close'}
            centered={true}
            closeButton={false}
            content={
                <>
                    <p className="thank-you-content">
                        Your Review has been submitted!
                    </p>
                    <p className="thank-you-share">
                        Do you have anything else to share?
                    </p>
                    <p className="thank-you-issue">
                        <a href={githubUrl} target="_blank" rel="noreferrer">
                            Open a GitHub issue
                        </a>{' '}
                        to leave more feedback{' '}
                    </p>
                </>
            }
            dialogClassName="thank-you"
            handleAction={handleAction}
            title={
                <div className="thank-you-title">
                    <FontAwesomeIcon
                        icon={faCheck}
                        className="thank-you-check"
                        color="green"
                    />
                    <h1>Thank you!</h1>
                </div>
            }
        />
    );
};

ThankYouModal.propTypes = {
    handleAction: PropTypes.func,
    githubUrl: PropTypes.string
};

export default ThankYouModal;
