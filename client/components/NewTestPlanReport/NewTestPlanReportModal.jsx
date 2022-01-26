import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client';
import {
    ADD_TEST_QUEUE_MUTATION,
    POPULATE_ADD_TEST_PLAN_TO_QUEUE_MODAL_QUERY
} from '../TestQueue/queries';
import './NewTestPlanReportModal.css';

const handleOpen = function() {
    document
        .querySelector('[role="dialog"].modal select:first-of-type')
        .focus();
};

const NewTestPlanReportModal = ({
    show = false,
    handleClose = () => {},
    handleAddToTestQueue = () => {}
}) => {
    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [allTestPlanVersions, setAllTestPlanVersions] = useState([]);
    const [filteredTestPlanVersions, setFilteredTestPlanVersions] = useState(
        []
    );
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [selectedAt, setSelectedAt] = useState('');
    const [selectedBrowser, setSelectedBrowser] = useState('');
    const [atVersion, setAtVersion] = useState('');
    const [browserVersion, setBrowserVersion] = useState('');
    const [selectedTestPlan, setSelectedTestPlan] = useState('');
    const [selectedTestPlanVersion, setSelectedTestPlanVersion] = useState('');

    // eslint-disable-next-line no-unused-vars
    const { data } = useQuery(POPULATE_ADD_TEST_PLAN_TO_QUEUE_MODAL_QUERY);
    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION);

    useEffect(() => {
        if (data) {
            const { ats = [], browsers = [], testPlanVersions = [] } = data;
            setAts(ats);
            setBrowsers(browsers);

            const allTestPlanVersions = testPlanVersions
                .map(version => ({
                    ...version
                }))
                .flat();

            setAllTestPlanVersions(allTestPlanVersions);

            // set the default AT and Browser dropdown values, since all dropdown fields are mandatory
            setSelectedAt(ats[0].id);
            setSelectedBrowser(browsers[0].id);
        }
    }, [data]);

    useEffect(() => {
        const filteredTestPlanVersions = allTestPlanVersions.filter(
            (v, i, a) =>
                a.findIndex(
                    t =>
                        t.title === v.title &&
                        t.testPlan.directory === v.testPlan.directory
                ) === i
        );

        setFilteredTestPlanVersions(filteredTestPlanVersions);

        // mark the first testPlanVersion as selected
        if (filteredTestPlanVersions.length) {
            const plan = filteredTestPlanVersions[0];

            setSelectedTestPlan(plan.id);

            // find the versions that apply and pre-set these
            const matchingTestPlanVersions = filteredTestPlanVersions.filter(
                item =>
                    item.title === plan.title &&
                    item.testPlan.directory === plan.testPlan.directory
            );

            setSelectedTestPlanVersion(matchingTestPlanVersions[0].id);
            setTestPlanVersions(matchingTestPlanVersions);
        }
    }, [allTestPlanVersions]);

    const handleCreateTestPlanReport = async () => {
        await addTestPlanReport({
            variables: {
                testPlanVersionId: selectedTestPlanVersion,
                atId: selectedAt,
                atVersion: atVersion,
                browserId: selectedBrowser,
                browserVersion: browserVersion
            }
        });
        await handleAddToTestQueue();
    };

    const dropdownRowWithInputField = ({ heading, dropdown, input }) => {
        return (
            <fieldset className="add-test-plan-queue-modal-row">
                <legend>
                    <h2>{heading}</h2>
                </legend>
                <Form.Group controlId={dropdown.id}>
                    <Form.Label>{dropdown.label}</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={e => dropdown.onSelect(e.target.value)}
                        value={dropdown.value}
                    >
                        {dropdown.options.map(item => (
                            <option
                                key={`${item.name}-${item.id}`}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group
                    controlId={input.id}
                    className="add-test-plan-queue-modal-normalize-row"
                >
                    <Form.Label>{input.label}</Form.Label>
                    <Form.Control
                        type="text"
                        value={input.value}
                        onChange={e => input.onChange(e.target.value)}
                    />
                </Form.Group>
            </fieldset>
        );
    };

    const dropdownsRow = ({ heading, dropdowns }) => {
        return (
            <fieldset>
                <legend>
                    <h2>{heading}</h2>
                </legend>
                {dropdowns.map(dropdown => (
                    <Form.Group key={dropdown.id} controlId={dropdown.id}>
                        <Form.Label>{dropdown.label}</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={e => dropdown.onSelect(e.target.value)}
                            value={dropdown.value}
                            disabled={
                                dropdown.isDisabled && dropdown.isDisabled()
                            }
                        >
                            {dropdown.options.map(dropdown.renderOption)}
                        </Form.Control>
                    </Form.Group>
                ))}
            </fieldset>
        );
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            onShow={handleOpen}
            aria-labelledby="add-test-plan-to-queue-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title as="h1" id="add-test-plan-to-queue-modal">
                    Add a Test Plan to the Test Queue
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="add-test-plan-queue-modal-container">
                    {dropdownRowWithInputField({
                        heading: 'Select an AT and Version',
                        dropdown: {
                            id: 'select-at',
                            label: 'Assistive Technology',
                            options: ats,
                            value: selectedAt,
                            onSelect: setSelectedAt
                        },
                        input: {
                            id: 'at-version',
                            label: 'AT Version',
                            value: atVersion,
                            onChange: setAtVersion
                        }
                    })}

                    {dropdownRowWithInputField({
                        heading: 'Select a Browser and Version',
                        dropdown: {
                            id: 'select-browser',
                            label: 'Browser',
                            options: browsers,
                            value: selectedBrowser,
                            onSelect: setSelectedBrowser
                        },
                        input: {
                            id: 'browser-version',
                            label: 'Browser Version',
                            value: browserVersion,
                            onChange: setBrowserVersion
                        }
                    })}

                    {dropdownsRow({
                        heading: 'Select a Test Plan and Version',
                        dropdowns: [
                            {
                                id: 'select-test-plan',
                                label: 'Test Plan',
                                options: filteredTestPlanVersions,
                                renderOption: item => (
                                    <option
                                        key={`${item.title ||
                                            item.testPlan.directory}-${
                                            item.id
                                        }`}
                                        value={item.id}
                                    >
                                        {item.title ||
                                            `"${item.testPlan.directory}"`}
                                    </option>
                                ),
                                onSelect: value => {
                                    // update test plan versions based on selected test plan
                                    const retrievedTestPlan = allTestPlanVersions.find(
                                        testPlanVersion =>
                                            testPlanVersion.id === value
                                    );
                                    const testPlanVersions = allTestPlanVersions.filter(
                                        testPlanVersion =>
                                            testPlanVersion.title ===
                                                retrievedTestPlan.title &&
                                            testPlanVersion.testPlan
                                                .directory ===
                                                retrievedTestPlan.testPlan
                                                    .directory
                                    );
                                    setTestPlanVersions(testPlanVersions);
                                    setSelectedTestPlanVersion(
                                        testPlanVersions[0].id
                                    );
                                    setSelectedTestPlan(value);
                                }
                            },
                            {
                                id: 'select-test-plan-version',
                                label: 'Test Plan Version',
                                isDisabled: () => !selectedTestPlan,
                                options: testPlanVersions,
                                renderOption: item => (
                                    <option
                                        key={`${item.gitSha}-${item.id}`}
                                        value={item.id}
                                    >
                                        {item.gitSha}
                                    </option>
                                ),
                                value: selectedTestPlanVersion,
                                onSelect: setSelectedTestPlanVersion
                            }
                        ]
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={async () => {
                        await handleCreateTestPlanReport();
                        await handleClose();
                    }}
                    disabled={
                        !(
                            selectedTestPlanVersion &&
                            selectedAt &&
                            atVersion &&
                            selectedBrowser &&
                            browserVersion
                        )
                    }
                >
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

NewTestPlanReportModal.propTypes = {
    show: PropTypes.bool,
    handleClose: PropTypes.func,
    handleAddToTestQueue: PropTypes.func
};

export default NewTestPlanReportModal;
