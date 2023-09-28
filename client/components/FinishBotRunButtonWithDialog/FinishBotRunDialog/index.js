import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../../common/BasicModal';
import AssignTesterDropdown from '../../TestQueue/AssignTesterDropdown';
import { useMutation, useQuery } from '@apollo/client';
import {
    COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
    MARK_COLLECTION_JOB_AS_FINISHED
} from '../queries';

const FinishBotRunDialog = ({
    testPlanReportId,
    testPlanRun,
    testers,
    show,
    setShow,
    onChange
}) => {
    const { data: collectionJobQuery } = useQuery(
        COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
        {
            variables: {
                testPlanRunId: testPlanRun.id
            },
            fetchPolicy: 'cache-and-network'
        }
    );

    const [markCollectionJobFinished] = useMutation(
        MARK_COLLECTION_JOB_AS_FINISHED,
        {
            variables: {
                collectionJobId:
                    collectionJobQuery?.collectionJobByTestPlanRunId?.id
            }
        }
    );

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
                        if (markCollectionJobFinished) {
                            await markCollectionJobFinished();
                        }
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
