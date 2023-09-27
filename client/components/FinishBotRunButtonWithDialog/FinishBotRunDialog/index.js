import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../../common/BasicModal';
import AssignTesterDropdown from '../../TestQueue/AssignTesterDropdown';

const FinishBotRunDialog = ({
    testPlanReportId,
    testPlanRun,
    testers,
    show,
    setShow,
    onChange
}) => {
    return (
        <BasicModal
            show={show}
            handleHide={() => setShow(false)}
            title="Finish Bot Run"
            cancelButton={false}
            content={<div></div>}
            actions={[
                {
                    component: AssignTesterDropdown,
                    props: {
                        testPlanReportId: testPlanReportId,
                        testPlanRun: testPlanRun,
                        possibleTesters: testers,
                        label: 'Assign To ...',
                        onChange
                    }
                },
                {
                    label: 'Mark as finished',
                    variant: 'secondary',
                    onClick: async () => {
                        // TODO: Implement
                        await onChange();
                    }
                },
                {
                    label: 'Delete',
                    variant: 'secondary',
                    onClick: async () => {
                        // TODO: Implement
                        await onChange();
                    }
                }
            ]}
        />
    );
};

FinishBotRunDialog.propTypes = {
    testPlanRun: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    testers: PropTypes.array.isRequired,
    testPlanReportId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FinishBotRunDialog;
