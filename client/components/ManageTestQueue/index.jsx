import React, { useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import UpdateVersionModal from '../common/UpdateVersionModal';
import BasicThemedModal from '../common/BasicThemedModal';
import {
    ADD_AT_VERSION_MUTATION,
    EDIT_AT_VERSION_MUTATION,
    DELETE_AT_VERSION_MUTATION,
    ADD_TEST_QUEUE_MUTATION
} from '../TestQueue/queries';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { convertStringToDate } from '../../utils/formatter';

const Container = styled.div`
    border: 1px solid #d3d5da;
    border-radius: 3px;
`;

const DisclosureButton = styled.button`
    position: relative;
    width: 100%;
    margin: 0;
    padding: 1.25rem;
    text-align: left;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 3px;
    background-color: transparent;

    &:nth-of-type(1) {
        border-radius: 3px 3px 0 0;
    }

    &:nth-last-of-type(1) {
        border-top: 1px solid #d3d5da;
        border-radius: 0 0 3px 3px;

        &:hover,
        &:focus {
            border-top: 1px solid #d3d5da;
        }
    }

    &:hover,
    &:focus {
        padding: 1.25rem;
        border: 0 solid #005a9c;
        background-color: #def;
        cursor: pointer;
    }

    &[aria-expanded='true']::after {
        content: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9.148' viewBox='0 0 16 9.148'%3e%3cpath d='M14.19,17.637l6.05-6.055a1.139,1.139,0,0,1,1.615,0,1.153,1.153,0,0,1,0,1.62L15,20.062a1.141,1.141,0,0,1-1.577.033l-6.9-6.888a1.144,1.144,0,0,1,1.615-1.62Z' transform='translate(22.188 20.395) rotate(180)' fill='%23969696'/%3e%3c/svg%3e") /
            'Up arrow';
        position: absolute;
        right: 1.25rem;
    }

    &[aria-expanded='false']::after {
        content: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9.148' viewBox='0 0 16 9.148'%3e%3cpath d='M14.19,17.637l6.05-6.055a1.139,1.139,0,0,1,1.615,0,1.153,1.153,0,0,1,0,1.62L15,20.062a1.141,1.141,0,0,1-1.577.033l-6.9-6.888a1.144,1.144,0,0,1,1.615-1.62Z' transform='translate(-6.188 -11.246)' fill='%23969696'/%3e%3c/svg%3e") /
            'Down arrow';
        position: absolute;
        right: 1.25rem;
    }
`;

const DisclosureContainer = styled.div`
    display: ${({ show }) => (show ? 'block' : 'none')};

    background-color: #f8f9fa;
    padding: 1.25rem;
    border-top: 1px solid #d3d5da;

    > span {
        display: block;
        margin-bottom: 1rem;
    }

    // Add Test Plan to Test Queue button
    > button {
        display: flex;
        padding: 0.5rem 1rem;
        margin-top: 1rem;
        margin-left: auto;
        margin-right: 0;
    }

    .disclosure-row-manage-ats {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;

        .ats-container {
            grid-column: 1 / span 2;
        }

        .at-versions-container {
            display: flex;
            flex-direction: column;
            grid-column: 3 / span 3;
        }

        .disclosure-buttons-row {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            > button {
                margin: 0;
                padding: 0;
                color: #275caa;
                border: none;
                background-color: transparent;

                &:nth-of-type(2) {
                    margin-left: auto;
                }

                // remove button
                &:nth-of-type(3) {
                    margin-left: 1rem;
                    color: #ce1b4c;
                }
            }
        }
    }

    .disclosure-row-test-plans {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
    }

    .disclosure-form-label {
        font-weight: bold;
        font-size: 1rem;
    }
`;

const ManageTestQueue = ({
    ats = [],
    browsers = [],
    testPlanVersions = [],
    triggerUpdate = () => {}
}) => {
    const loadedAts = useRef(false);
    const focusButtonRef = useRef();
    const addAtVersionButtonRef = useRef();
    const editAtVersionButtonRef = useRef();
    const deleteAtVersionButtonRef = useRef();
    const addTestPlanReportButtonRef = useRef();

    const [showManageATs, setShowManageATs] = useState(false);
    const [showAddTestPlans, setShowAddTestPlans] = useState(false);
    const [selectedManageAtId, setSelectedManageAtId] = useState('');
    const [selectedManageAtVersions, setSelectedManageAtVersions] = useState(
        []
    );
    const [selectedManageAtVersionId, setSelectedManageAtVersionId] = useState(
        ''
    );

    const [showAtVersionModal, setShowAtVersionModal] = useState(false);
    const [atVersionModalTitle, setAtVersionModalTitle] = useState('');
    const [atVersionModalType, setAtVersionModalType] = useState('add');
    const [atVersionModalVersionText, setAtVersionModalVersionText] = useState(
        ''
    );
    const [atVersionModalDateText, setAtVersionModalDateText] = useState('');

    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalType, setThemedModalType] = useState('warning');
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackModalTitle, setFeedbackModalTitle] = useState('');
    const [feedbackModalContent, setFeedbackModalContent] = useState(<></>);

    const [allTestPlanVersions, setAllTestPlanVersions] = useState([]);
    const [filteredTestPlanVersions, setFilteredTestPlanVersions] = useState(
        []
    );
    const [selectedTestPlanVersionId, setSelectedTestPlanVersionId] = useState(
        ''
    );
    const [matchingTestPlanVersions, setMatchingTestPlanVersions] = useState(
        []
    );

    const [selectedAtId, setSelectedAtId] = useState('');
    const [selectedBrowserId, setSelectedBrowserId] = useState('');

    const [addAtVersion] = useMutation(ADD_AT_VERSION_MUTATION);
    const [editAtVersion] = useMutation(EDIT_AT_VERSION_MUTATION);
    const [deleteAtVersion] = useMutation(DELETE_AT_VERSION_MUTATION);
    const [addTestPlanReport] = useMutation(ADD_TEST_QUEUE_MUTATION);

    const onManageAtsClick = () => setShowManageATs(!showManageATs);
    const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);

    useEffect(() => {
        const allTestPlanVersions = testPlanVersions
            .map(version => ({ ...version }))
            .flat();

        // to remove duplicate entries from different test plan versions of the same test plan being imported multiple times
        const filteredTestPlanVersions = allTestPlanVersions.filter(
            (v, i, a) =>
                a.findIndex(
                    t =>
                        t.title === v.title &&
                        t.testPlan.directory === v.testPlan.directory
                ) === i
        );

        // mark the first testPlanVersion as selected
        if (filteredTestPlanVersions.length) {
            const plan = filteredTestPlanVersions[0];
            updateMatchingTestPlanVersions(plan.id, allTestPlanVersions);
        }

        setAllTestPlanVersions(allTestPlanVersions);
        setFilteredTestPlanVersions(filteredTestPlanVersions);
    }, [testPlanVersions]);

    useEffect(() => {
        if (ats.length) {
            if (!loadedAts.current) setSelectedManageAtId(ats[0].id);

            // Required during refetch logic around managing AT Versions
            if (!loadedAts.current)
                setSelectedManageAtVersions(ats[0].atVersions);
            else
                setSelectedManageAtVersions(
                    ats.find(item => item.id === selectedManageAtId).atVersions
                );

            if (!loadedAts.current)
                setSelectedManageAtVersionId(ats[0]?.atVersions[0]?.id);
            loadedAts.current = true;
        }
    }, [ats]);

    const updateMatchingTestPlanVersions = (value, allTestPlanVersions) => {
        // update test plan versions based on selected test plan
        const retrievedTestPlan = allTestPlanVersions.find(
            item => item.id === value
        );

        // find the versions that apply and pre-set these
        const matchingTestPlanVersions = allTestPlanVersions.filter(
            item =>
                item.title === retrievedTestPlan.title &&
                item.testPlan.directory === retrievedTestPlan.testPlan.directory
        );
        setMatchingTestPlanVersions(matchingTestPlanVersions);
        setSelectedTestPlanVersionId(matchingTestPlanVersions[0].id);
    };

    const onManageAtChange = e => {
        const { value } = e.target;
        if (selectedManageAtId !== value) {
            setSelectedManageAtId(value);
            const at = ats.find(item => item.id === value);
            setSelectedManageAtVersions(at.atVersions);
            setSelectedManageAtVersionId(at.atVersions[0].id);
        }
    };

    const onManageAtVersionChange = e => {
        const { value } = e.target;
        setSelectedManageAtVersionId(value);
    };

    const onOpenAtVersionModalClick = (type = 'add') => {
        if (type === 'add') {
            focusButtonRef.current = addAtVersionButtonRef.current;

            const selectedAt = ats.find(item => item.id === selectedManageAtId);
            setAtVersionModalTitle(`Add a New Version for ${selectedAt.name}`);
            setAtVersionModalType('add');
            setAtVersionModalVersionText('');
            setAtVersionModalDateText('');
            setShowAtVersionModal(true);
        }

        if (type === 'edit') {
            focusButtonRef.current = editAtVersionButtonRef.current;

            const selectedAt = ats.find(item => item.id === selectedManageAtId);
            setAtVersionModalTitle(
                `Edit ${selectedAt.name} Version ${
                    getAtVersionFromId(selectedManageAtVersionId)?.name
                }`
            );
            setAtVersionModalType('edit');
            setAtVersionModalVersionText(
                getAtVersionFromId(selectedManageAtVersionId)?.name
            );
            setAtVersionModalDateText(
                getAtVersionFromId(selectedManageAtVersionId)?.releasedAt
            );
            setShowAtVersionModal(true);
        }
    };

    const onRemoveClick = () => {
        focusButtonRef.current = deleteAtVersionButtonRef.current;

        const theme = 'danger';
        const selectedAt = ats.find(item => item.id === selectedManageAtId);

        setThemedModalTitle(
            `Remove ${selectedAt.name} Version ${
                getAtVersionFromId(selectedManageAtVersionId)?.name
            }`
        );
        setThemedModalContent(
            <>
                You are about to remove{' '}
                <b>
                    {selectedAt.name} Version{' '}
                    {getAtVersionFromId(selectedManageAtVersionId)?.name}
                </b>{' '}
                from the ARIA-AT App.
            </>
        );

        setThemedModalType(theme);
        setShowThemedModal(true);
    };

    const onUpdateModalClose = () => {
        setAtVersionModalVersionText('');
        setAtVersionModalDateText('');
        setShowAtVersionModal(false);
        focusButtonRef.current.focus();
    };

    const onThemedModalClose = () => {
        setShowThemedModal(false);
        focusButtonRef.current.focus();
    };

    const getAtVersionFromId = id => {
        return selectedManageAtVersions.find(item => id === item.id);
    };

    const onAtChange = e => {
        const { value } = e.target;
        setSelectedAtId(value);
    };

    const onBrowserChange = e => {
        const { value } = e.target;
        setSelectedBrowserId(value);
    };

    const onTestPlanVersionChange = e => {
        const { value } = e.target;
        setSelectedTestPlanVersionId(value);
    };

    const onUpdateAtVersionAction = async (
        actionType,
        { updatedVersionText, updatedDateAvailabilityText }
    ) => {
        const selectedAt = ats.find(item => item.id === selectedManageAtId);

        if (actionType === 'add') {
            const existingAtVersion = selectedManageAtVersions.find(
                item => item.name.trim() === updatedVersionText.trim()
            );
            if (existingAtVersion) {
                setSelectedManageAtVersionId(existingAtVersion.id);

                onUpdateModalClose();

                setFeedbackModalTitle('Existing Assistive Technology Version');
                setFeedbackModalContent(
                    <>
                        <b>
                            {selectedAt.name} {updatedVersionText}
                        </b>{' '}
                        already exists in the system. Please try adding a
                        different one.
                    </>
                );
                setShowFeedbackModal(true);
                return;
            }

            const addAtVersionData = await addAtVersion({
                variables: {
                    atId: selectedManageAtId,
                    name: updatedVersionText,
                    releasedAt: convertStringToDate(updatedDateAvailabilityText)
                }
            });
            setSelectedManageAtVersionId(
                addAtVersionData.data?.at?.findOrCreateAtVersion?.id
            );

            await triggerUpdate();
            onUpdateModalClose();

            setFeedbackModalTitle('Successfully Added AT Version');
            setFeedbackModalContent(
                <>
                    Successfully added{' '}
                    <b>
                        {selectedAt.name} {updatedVersionText}
                    </b>
                    .
                </>
            );
            setShowFeedbackModal(true);
        }

        if (actionType === 'edit') {
            await editAtVersion({
                variables: {
                    atVersionId: selectedManageAtVersionId,
                    name: updatedVersionText,
                    releasedAt: convertStringToDate(updatedDateAvailabilityText)
                }
            });
            await triggerUpdate();
            onUpdateModalClose();

            setFeedbackModalTitle('Successfully Updated AT Version');
            setFeedbackModalContent(
                <>
                    Successfully updated{' '}
                    <b>
                        {selectedAt.name} {updatedVersionText}
                    </b>
                    .
                </>
            );
            setShowFeedbackModal(true);
        }

        if (actionType === 'delete') {
            const deleteAtVersionData = await deleteAtVersion({
                variables: {
                    atVersionId: selectedManageAtVersionId
                }
            });
            if (
                !deleteAtVersionData.data?.atVersion?.deleteAtVersion?.isDeleted
            ) {
                const patternName =
                    deleteAtVersionData.data?.atVersion?.deleteAtVersion
                        ?.failedDueToTestResults[0]?.testPlanVersion?.title;
                const theme = 'warning';

                // Removing an AT Version already in use
                setThemedModalTitle(
                    'Assistive Technology Version already being used'
                );
                setThemedModalContent(
                    <>
                        <b>
                            {selectedAt.name} Version{' '}
                            {
                                getAtVersionFromId(selectedManageAtVersionId)
                                    ?.name
                            }
                        </b>{' '}
                        can&apos;t be removed because it is already being used
                        to test the <b>{patternName}</b> Test Plan.
                    </>
                );

                setThemedModalType(theme);
                setShowThemedModal(true);
            } else {
                onThemedModalClose();
                await triggerUpdate();

                // Show confirmation that AT has been deleted
                setFeedbackModalTitle('Successfully Removed AT Version');
                setFeedbackModalContent(
                    <>
                        Successfully removed version for{' '}
                        <b>{selectedAt.name}</b>.
                    </>
                );
                setShowFeedbackModal(true);

                // Reset atVersion to valid existing item
                setSelectedManageAtVersionId(selectedAt.atVersions[0]?.id);
            }
        }
    };

    const handleAddTestPlanToTestQueue = async () => {
        focusButtonRef.current = addTestPlanReportButtonRef.current;

        const selectedTestPlanVersion = filteredTestPlanVersions.find(
            item => item.id === selectedTestPlanVersionId
        );
        const selectedAt = ats.find(item => item.id === selectedAtId);
        const selectedBrowser = browsers.find(
            item => item.id === selectedBrowserId
        );

        await addTestPlanReport({
            variables: {
                testPlanVersionId: selectedTestPlanVersionId,
                atId: selectedAtId,
                browserId: selectedBrowserId
            }
        });
        await triggerUpdate();

        setFeedbackModalTitle('Successfully Added Test Plan');
        setFeedbackModalContent(
            <>
                Successfully added <b>{selectedTestPlanVersion.title}</b> for{' '}
                <b>
                    {selectedAt.name} and {selectedBrowser.name}
                </b>{' '}
                to the Test Queue.
            </>
        );
        setShowFeedbackModal(true);
    };

    return (
        <Container>
            <DisclosureButton
                type="button"
                aria-expanded={showManageATs}
                aria-controls="id_manage_ats"
                onClick={onManageAtsClick}
            >
                Manage Assistive Technology Versions
            </DisclosureButton>
            <DisclosureContainer id="id_manage_ats" show={showManageATs}>
                <span>
                    Select an Assistive Technology and manage its versions in
                    the ARIA-AT App
                </span>
                <div className="disclosure-row-manage-ats">
                    <Form.Group className="ats-container">
                        <Form.Label className="disclosure-form-label">
                            Assistive Technology
                        </Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedManageAtId}
                            onChange={onManageAtChange}
                        >
                            {ats.map(item => (
                                <option
                                    key={`manage-${item.name}-${item.id}`}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <div className="at-versions-container">
                        <Form.Group>
                            <Form.Label className="disclosure-form-label">
                                Available Versions
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedManageAtVersionId}
                                onChange={onManageAtVersionChange}
                            >
                                {selectedManageAtVersions.map(item => (
                                    <option
                                        key={`${selectedManageAtId}-${item.id}-${item.name}`}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <div className="disclosure-buttons-row">
                            <button
                                ref={addAtVersionButtonRef}
                                onClick={() => onOpenAtVersionModalClick('add')}
                            >
                                Add a New Version
                            </button>
                            <button
                                ref={editAtVersionButtonRef}
                                onClick={() =>
                                    onOpenAtVersionModalClick('edit')
                                }
                            >
                                <FontAwesomeIcon icon={faEdit} />
                                Edit
                            </button>
                            <button
                                ref={deleteAtVersionButtonRef}
                                onClick={onRemoveClick}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </DisclosureContainer>
            <DisclosureButton
                type="button"
                aria-expanded={showAddTestPlans}
                aria-controls="id_test_plans"
                onClick={onAddTestPlansClick}
            >
                Add Test Plans to the Test Queue
            </DisclosureButton>
            <DisclosureContainer id="id_test_plans" show={showAddTestPlans}>
                <span>
                    Select a Test Plan and version and an Assistive Technology
                    and Browser to add it to the Test Queue
                </span>
                <div className="disclosure-row-test-plans">
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Test Plan
                        </Form.Label>
                        <Form.Control
                            as="select"
                            onChange={e => {
                                const { value } = e.target;
                                updateMatchingTestPlanVersions(
                                    value,
                                    allTestPlanVersions
                                );
                            }}
                        >
                            {filteredTestPlanVersions.map(item => (
                                <option
                                    key={`${item.title ||
                                        item.testPlan.directory}-${item.id}`}
                                    value={item.id}
                                >
                                    {item.title ||
                                        `"${item.testPlan.directory}"`}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Test Plan Version
                        </Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedTestPlanVersionId}
                            onChange={onTestPlanVersionChange}
                        >
                            {matchingTestPlanVersions.map(item => (
                                <option
                                    key={`${item.gitSha}-${item.id}`}
                                    value={item.id}
                                >
                                    {gitUpdatedDateToString(item.updatedAt)}{' '}
                                    {item.gitMessage} (
                                    {item.gitSha.substring(0, 7)})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Assistive Technology
                        </Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedAtId}
                            onChange={onAtChange}
                        >
                            <option value={''} disabled>
                                --
                            </option>
                            {ats.map(item => (
                                <option
                                    key={`${item.name}-${item.id}`}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Browser
                        </Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedBrowserId}
                            onChange={onBrowserChange}
                        >
                            <option value={''} disabled>
                                --
                            </option>
                            {browsers.map(item => (
                                <option
                                    key={`${item.name}-${item.id}`}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </div>
                <Button
                    ref={addTestPlanReportButtonRef}
                    variant="primary"
                    disabled={
                        !selectedTestPlanVersionId ||
                        !selectedAtId ||
                        !selectedBrowserId
                    }
                    onClick={handleAddTestPlanToTestQueue}
                >
                    Add Test Plan to Test Queue
                </Button>
            </DisclosureContainer>

            {showAtVersionModal && (
                <UpdateVersionModal
                    show={showAtVersionModal}
                    title={atVersionModalTitle}
                    actionType={atVersionModalType}
                    versionText={atVersionModalVersionText}
                    dateAvailabilityText={atVersionModalDateText}
                    handleAction={onUpdateAtVersionAction}
                    handleClose={onUpdateModalClose}
                />
            )}

            {showThemedModal && (
                <BasicThemedModal
                    show={showThemedModal}
                    theme={themedModalType}
                    title={themedModalTitle}
                    dialogClassName="modal-50w"
                    content={themedModalContent}
                    actionButtons={[
                        {
                            text:
                                themedModalType === 'danger' ? 'Remove' : 'Ok',
                            action:
                                themedModalType === 'danger'
                                    ? () =>
                                          onUpdateAtVersionAction('delete', {})
                                    : onThemedModalClose
                        }
                    ]}
                    handleClose={onThemedModalClose}
                    showCloseAction={themedModalType === 'danger'}
                />
            )}

            {showFeedbackModal && (
                <BasicModal
                    show={showFeedbackModal}
                    closeButton={false}
                    title={feedbackModalTitle}
                    content={feedbackModalContent}
                    closeLabel="Ok"
                    handleClose={() => {
                        setShowFeedbackModal(false);
                        focusButtonRef.current.focus();
                    }}
                />
            )}
        </Container>
    );
};

ManageTestQueue.propTypes = {
    ats: PropTypes.array,
    browsers: PropTypes.array,
    testPlanVersions: PropTypes.array,
    triggerUpdate: PropTypes.func
};

export default ManageTestQueue;
