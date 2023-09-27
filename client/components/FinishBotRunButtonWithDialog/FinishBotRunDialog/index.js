import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../../common/BasicModal';

const FinishBotRunDialog = ({ testPlanRun, show, setShow }) => {
    return (
        <BasicModal
            show={show}
            handleClose={() => setShow(false)}
            title="Finish Bot Run"
            content={<div>Finish Bot Run</div>}
        />
    );
};

FinishBotRunDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired
};

export default FinishBotRunDialog;
