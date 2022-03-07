import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import './TestPlanUpdaterModal.css';
import '../TestRun/TestRun.css';

const TestPlanUpdaterModal = ({ show, handleClose }) => {
    return (
        <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
            <Modal.Header closeButton className="test-plan-updater-header">
                <Modal.Title>Test Plan Updater</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="version-info-wrapper">
                    <div className="version-info-label">
                        Test Plan: Banner Landmark
                    </div>
                    <div className="version-info-label">
                        AT and Browser: Jaws 2 with Chrome 2
                    </div>
                    <div className="current-version version-info-label">
                        Current version: Jan 6, 2022 at 8:50:28 pm UTC Create
                        tests for APG design pattern example: Main Landmark
                        (#553) (4ed847a)
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
    handleAction: PropTypes.func
};

export default TestPlanUpdaterModal;
