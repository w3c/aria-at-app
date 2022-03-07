import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient } from '@apollo/client';
import { Modal, Button, Form } from 'react-bootstrap';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { TEST_PLAN_ID_QUERY, UPDATER_QUERY } from './queries';
import './TestPlanUpdaterModal.css';
import '../TestRun/TestRun.css';

const TestPlanUpdaterModal = ({ show, handleClose, testPlanReportId }) => {
    const loadInitialData = async ({
        client,
        setUpdaterData,
        testPlanReportId
    }) => {
        if (!testPlanReportId) throw new Error('No id found in URL');

        const { data: testPlanIdData } = await client.query({
            query: TEST_PLAN_ID_QUERY,
            variables: { testPlanReportId }
        });
        const testPlanId =
            testPlanIdData?.testPlanReport?.testPlanVersion?.testPlan?.id;

        if (!testPlanId)
            throw new Error(
                `Could not find test plan report with id "${testPlanReportId}"`
            );

        const { data: updaterData } = await client.query({
            query: UPDATER_QUERY,
            variables: { testPlanReportId, testPlanId }
        });
        setUpdaterData(updaterData);
    };

    const client = useApolloClient();
    const [updaterData, setUpdaterData] = useState();

    useEffect(() => {
        loadInitialData({ client, setUpdaterData, testPlanReportId });
    }, []);

    if (!updaterData) {
        return <Modal show={false}></Modal>;
    }

    const {
        testPlanReport: {
            id: currentReportId,
            testPlanTarget: {
                at: { id: atId, name: atName },
                atVersion,
                browser: { id: browserId, name: browserName },
                browserVersion
            },
            testPlanVersion: currentVersion
        },
        testPlan: { testPlanVersions }
    } = updaterData;

    return (
        <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
            <Modal.Header closeButton className="test-plan-updater-header">
                <Modal.Title>Test Plan Updater</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="version-info-wrapper">
                    <div className="version-info-label">
                        <b>Test Plan:</b> {currentVersion.title}
                    </div>
                    <div className="version-info-label">
                        <b>AT and Browser:</b> {atName} {atVersion} with{' '}
                        {browserName} {browserVersion}
                    </div>
                    <div className="current-version version-info-label">
                        <b>Current version:</b>{' '}
                        {gitUpdatedDateToString(currentVersion.updatedAt)}{' '}
                        {currentVersion.gitMessage} (
                        {currentVersion.gitSha.substring(0, 7)})
                    </div>
                </div>
                <div>
                    <h3>Select a Different Test Plan Version</h3>
                    <Form.Control as="select" defaultValue="unselected">
                        <option value="unselected">
                            Please choose a new version
                        </option>
                    </Form.Control>
                </div>
            </Modal.Body>
            <Modal.Footer className="test-plan-updater-footer">
                <div className="submit-buttons-row">
                    <Form.Check
                        type="checkbox"
                        id="default-checkbox"
                        label="delete"
                        className="default-checkbox"
                    />
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        className="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleClose}
                        className="submit-button"
                    >
                        Update Test Plan
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

TestPlanUpdaterModal.propTypes = {
    show: PropTypes.bool,
    isAdmin: PropTypes.bool,
    details: PropTypes.object,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func,
    testPlanReportId: PropTypes.string
};

export default TestPlanUpdaterModal;
