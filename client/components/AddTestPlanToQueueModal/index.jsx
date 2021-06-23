import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';

const POPULATE_MODAL_QUERY = gql`
    query {
        ats {
            id
            name
            atVersions
        }
        browsers {
            id
            name
            browserVersions
        }
        testPlanVersions {
            id
            title
            gitSha
            directory
        }
    }
`;

const AddTestPlanToQueueModal = ({
    show = false,
    handleClose = () => {},
    handleAddToTestQueue = () => {}
}) => {
    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [filteredTestPlans, setFilteredTestPlans] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [selectedAt, setSelectedAt] = useState('');
    const [selectedBrowser, setSelectedBrowser] = useState('');
    const [atVersion, setAtVersion] = useState('');
    const [browserVersion, setBrowserVersion] = useState('');
    const [selectedTestPlan, setSelectedTestPlan] = useState('');
    const [selectedTestPlanVersion, setSelectedTestPlanVersion] = useState('');

    // eslint-disable-next-line no-unused-vars
    const { loading, error, data } = useQuery(POPULATE_MODAL_QUERY);

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions: testPlans = []
            } = data;
            setAts(ats);
            setBrowsers(browsers);
            setTestPlans(testPlans);
        }
    }, [data]);

    useEffect(() => {
        const filteredTestPlans = testPlans.filter(
            (v, i, a) =>
                a.findIndex(
                    t => t.title === v.title && t.directory === v.directory
                ) === i
        );
        setFilteredTestPlans(filteredTestPlans);
    }, [testPlans]);

    const dropdownRowWithInputField = ({
        label,
        dropdownOptions,
        dropdownPlaceholder,
        inputFieldPlaceholder,
        dropdownValue,
        inputFieldValue,
        handleDropdownSelected,
        handleInputFieldUpdated
    }) => {
        return (
            <div className="add-test-plan-queue-modal-row">
                <Form.Group controlId="formBasicSelect">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={e => handleDropdownSelected(e.target.value)}
                        value={dropdownValue}
                    >
                        <option disabled value={''}>
                            {dropdownPlaceholder}
                        </option>
                        {dropdownOptions.map(item => (
                            <option
                                key={`${item.name}-${item.id}`}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="add-test-plan-queue-modal-normalize-row">
                    <Form.Control
                        type="text"
                        value={inputFieldValue}
                        placeholder={inputFieldPlaceholder}
                        disabled={!dropdownValue}
                        onChange={e => handleInputFieldUpdated(e.target.value)}
                    />
                </Form.Group>
            </div>
        );
    };

    const dropdownsRow = ({
        label,
        primaryDropdownOptions,
        secondaryDropdownOptions,
        primaryDropdownPlaceholder,
        secondaryDropdownPlaceholder,
        primaryDropdownValue,
        secondaryDropdownValue,
        handlePrimaryDropdownSelected,
        handleSecondaryDropdownSelected
    }) => {
        return (
            <div className="add-test-plan-queue-modal-row">
                <Form.Group controlId="formBasicSelect">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={e =>
                            handlePrimaryDropdownSelected(e.target.value)
                        }
                        value={primaryDropdownValue}
                    >
                        <option disabled value={''}>
                            {primaryDropdownPlaceholder}
                        </option>
                        {primaryDropdownOptions.map(item => (
                            <option
                                key={`${item.title || item.directory}-${
                                    item.id
                                }`}
                                value={item.id}
                            >
                                {item.title || `"${item.directory}"`}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group
                    controlId="formBasicSelect"
                    className="add-test-plan-queue-modal-normalize-row"
                >
                    <Form.Control
                        as="select"
                        onChange={e =>
                            handleSecondaryDropdownSelected(e.target.value)
                        }
                        value={secondaryDropdownValue}
                    >
                        <option disabled value={''}>
                            {secondaryDropdownPlaceholder}
                        </option>
                        {secondaryDropdownOptions.map(item => (
                            <option
                                key={`${item.gitSha}-${item.id}`}
                                value={item.id}
                            >
                                {item.gitSha}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add a Test Plan to the Test Queue</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="add-test-plan-queue-modal-container">
                    {dropdownRowWithInputField({
                        label: 'Select an AT and Version',
                        dropdownOptions: ats,
                        dropdownPlaceholder: 'Assistive Technology',
                        inputFieldPlaceholder: 'AT Version',
                        dropdownValue: selectedAt,
                        inputFieldValue: atVersion,
                        handleDropdownSelected: setSelectedAt,
                        handleInputFieldUpdated: setAtVersion
                    })}

                    {dropdownRowWithInputField({
                        label: 'Select a Browser and Version',
                        dropdownOptions: browsers,
                        dropdownPlaceholder: 'Browser',
                        inputFieldPlaceholder: 'Browser Version',
                        dropdownValue: selectedBrowser,
                        inputFieldValue: browserVersion,
                        handleDropdownSelected: setSelectedBrowser,
                        handleInputFieldUpdated: setBrowserVersion
                    })}

                    {dropdownsRow({
                        label: 'Select a Test Plan and Version',
                        primaryDropdownOptions: filteredTestPlans,
                        secondaryDropdownOptions: testPlanVersions,
                        primaryDropdownPlaceholder: 'Test Plan',
                        secondaryDropdownPlaceholder: 'Version',
                        primaryDropdownValue: selectedTestPlan,
                        secondaryDropdownValue: selectedTestPlanVersion,
                        handlePrimaryDropdownSelected: value => {
                            // update test plan versions based on selected test plan
                            const retrievedTestPlan = testPlans.find(
                                testPlan => testPlan.id === value
                            );
                            const testPlanVersions = testPlans.filter(
                                testPlan =>
                                    testPlan.title ===
                                        retrievedTestPlan.title &&
                                    testPlan.directory ===
                                        retrievedTestPlan.directory
                            );
                            setTestPlanVersions(testPlanVersions);

                            // TODO: Optimize to only clear test plan version if test plan changed
                            setSelectedTestPlanVersion('');
                            setSelectedTestPlan(value);
                        },
                        handleSecondaryDropdownSelected: setSelectedTestPlanVersion
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleAddToTestQueue}>
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

AddTestPlanToQueueModal.propTypes = {
    show: PropTypes.bool,
    handleClose: PropTypes.func,
    handleAddToTestQueue: PropTypes.func
};

export default AddTestPlanToQueueModal;
