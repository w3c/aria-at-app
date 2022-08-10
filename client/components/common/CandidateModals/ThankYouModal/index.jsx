import React from 'react';
import BasicModal from '../../BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import '../common.css';
import './ThankYouModal.css';

const ThankYouModal = ({ show = false, handleAction = () => {} }) => {
    return (
        <BasicModal
            show={show}
            actionLabel={'Close'}
            centered={true}
            closeButton={false}
            content={
                <p className="thank-you-content">
                    Your Review has been submitted!
                </p>
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
    show: PropTypes.bool,
    handleAction: PropTypes.func
};

export default ThankYouModal;
