import React from 'react';
import BasicModal from '../../common/BasicModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const ThankYouModal = ({ show = false, handleClose = () => {} }) => {
    return (
        <BasicModal
            show={show}
            centered={true}
            closeButton={false}
            closeLabel={'Close'}
            cancelButton={true}
            content={'Your review has been submitted!'}
            handleClose={handleClose}
            title={
                <div>
                    <FontAwesomeIcon icon={faCheck} />
                    <h1>Thank you!</h1>
                </div>
            }
        />
    );
};

ThankYouModal.propTypes = {
    show: PropTypes.bool,
    handleClose: PropTypes.func,
    username: PropTypes.string
};

export default ThankYouModal;
