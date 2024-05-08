import React, { useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { Form } from 'react-bootstrap';
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
    DELETE_AT_VERSION_MUTATION
} from '../TestQueue/queries';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { convertStringToDate } from '../../utils/formatter';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import RadioBox from '../common/RadioBox';

const DisclosureContainer = styled.div`
    // Following directives are related to the ManageTestQueue component
    > span {
        display: block;
        margin-bottom: 1rem;
    }

    // Add Test Plan to Test Queue button
    > button {
        padding: 0.5rem 1rem;
        margin-top: 1rem;
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
        grid-template-columns: 1fr;
        row-gap: 0.5rem;

        & > :nth-of-type(2) {
            display: none;
        }
        & > :nth-of-type(5) {
            grid-column: span 2;
        }

        @media (min-width: 768px) {
            grid-template-columns: 2fr 2fr 1fr;
            column-gap: 2rem;

            & > :nth-of-type(2) {
                display: block;
            }
        }
    }

    .form-group-at-version {
        display: flex;
        flex-wrap: wrap;
        column-gap: 1rem;
        row-gap: 0.75rem;

        select {
            width: inherit;
            @media (max-width: 767px) {
                flex-grow: 1;
            }
        }
    }

    .disclosure-form-label {
        font-weight: bold;
        font-size: 1rem;
    }
`;

const ManageTestQueue = ({
    ats = [],
    testPlanVersions = [],
    triggerUpdate = () => {}
}) => {
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const loadedAts = useRef(false);
    const focusButtonRef = useRef();
    const addAtVersionButtonRef = useRef();
    const editAtVersionButtonRef = useRef();
    const deleteAtVersionButtonRef = useRef();

    const [showManageATs, setShowManageATs] = useState(false);
    const [showAddTestPlans, setShowAddTestPlans] = useState(false);
    const [selectedManageAtId, setSelectedManageAtId] = useState('1');
    const [selectedManageAtVersions, setSelectedManageAtVersions] = useState(
        []
    );
    const [selectedManageAtVersionId, setSelectedManageAtVersionId] =
        useState('');

    const [showAtVersionModal, setShowAtVersionModal] = useState(false);
    const [atVersionModalTitle, setAtVersionModalTitle] = useState('');
    const [atVersionModalType, setAtVersionModalType] = useState('add');
    const [atVersionModalVersionText, setAtVersionModalVersionText] =
        useState('');
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
    const [selectedTestPlanVersionId, setSelectedTestPlanVersionId] =
        useState('');
    const [matchingTestPlanVersions, setMatchingTestPlanVersions] = useState(
        []
    );

    const [selectedAtId, setSelectedAtId] = useState('');
    const [selectedBrowserId, setSelectedBrowserId] = useState('');
    const [
        selectedAtVersionExactOrMinimum,
        setSelectedAtVersionExactOrMinimum
    ] = useState('Exact Version');
    const [selectedReportAtVersionId, setSelectedReportAtVersionId] =
        useState(null);
    const [
        showMinimumAtVersionErrorMessage,
        setShowMinimumAtVersionErrorMessage
    ] = useState(false);

    const [addAtVersion] = useMutation(ADD_AT_VERSION_MUTATION);
    const [editAtVersion] = useMutation(EDIT_AT_VERSION_MUTATION);
    const [deleteAtVersion] = useMutation(DELETE_AT_VERSION_MUTATION);

    const onManageAtsClick = () => setShowManageATs(!showManageATs);
    const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);

    useEffect(() => {
        const allTestPlanVersions = testPlanVersions
            .map(version => ({ ...version }))
            .flat();

        // to remove duplicate entries from different test plan versions of the same test plan being imported multiple times
        const filteredTestPlanVersions = allTestPlanVersions
            .filter(
                (v, i, a) =>
                    a.findIndex(
                        t =>
                            t.title === v.title &&
                            t.testPlan.directory === v.testPlan.directory
                    ) === i
            )
            // sort by the testPlanVersion titles
            .sort((a, b) => (a.title < b.title ? -1 : 1));

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
        const matchingTestPlanVersions = allTestPlanVersions
            .filter(
                item =>
                    item.title === retrievedTestPlan.title &&
                    item.testPlan.directory ===
                        retrievedTestPlan.testPlan.directory &&
                    item.phase !== 'DEPRECATED' &&
                    item.phase !== 'RD'
            )
            .sort((a, b) =>
                new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1
            );
        setMatchingTestPlanVersions(matchingTestPlanVersions);

        if (matchingTestPlanVersions.length)
            setSelectedTestPlanVersionId(matchingTestPlanVersions[0].id);
        else setSelectedTestPlanVersionId(null);
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

        showThemedMessage(
            `Remove ${selectedAt.name} Version ${
                getAtVersionFromId(selectedManageAtVersionId)?.name
            }`,
            <>
                You are about to remove{' '}
                <b>
                    {selectedAt.name} Version{' '}
                    {getAtVersionFromId(selectedManageAtVersionId)?.name}
                </b>{' '}
                from the ARIA-AT App.
            </>,
            theme
        );
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
        setShowMinimumAtVersionErrorMessage(false);
        setSelectedAtId(value);
        setSelectedReportAtVersionId(null);
    };

    const onBrowserChange = e => {
        const { value } = e.target;
        setSelectedBrowserId(value);
    };

    const onReportAtVersionIdChange = e => {
        const { value } = e.target;
        setSelectedReportAtVersionId(value);
    };

    const onTestPlanVersionChange = e => {
        const { value } = e.target;
        setShowMinimumAtVersionErrorMessage(false);
        setSelectedAtVersionExactOrMinimum('Exact Version');
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
                showFeedbackMessage(
                    'Existing Assistive Technology Version',
                    <>
                        <b>
                            {selectedAt.name} {updatedVersionText}
                        </b>{' '}
                        already exists in the system. Please try adding a
                        different one.
                    </>
                );
                return;
            }

            onUpdateModalClose();
            await triggerLoad(async () => {
                const addAtVersionData = await addAtVersion({
                    variables: {
                        atId: selectedManageAtId,
                        name: updatedVersionText,
                        releasedAt: convertStringToDate(
                            updatedDateAvailabilityText
                        )
                    }
                });
                setSelectedManageAtVersionId(
                    addAtVersionData.data?.at?.findOrCreateAtVersion?.id
                );
                await triggerUpdate();
            }, 'Adding Assistive Technology Version');

            showFeedbackMessage(
                'Successfully Added Assistive Technology Version',
                <>
                    Successfully added{' '}
                    <b>
                        {selectedAt.name} {updatedVersionText}
                    </b>
                    .
                </>
            );
        }

        if (actionType === 'edit') {
            onUpdateModalClose();
            await triggerLoad(async () => {
                await editAtVersion({
                    variables: {
                        atVersionId: selectedManageAtVersionId,
                        name: updatedVersionText,
                        releasedAt: convertStringToDate(
                            updatedDateAvailabilityText
                        )
                    }
                });
                await triggerUpdate();
            }, 'Updating Assistive Technology Version');

            showFeedbackMessage(
                'Successfully Updated Assistive Technology Version',
                <>
                    Successfully updated{' '}
                    <b>
                        {selectedAt.name} {updatedVersionText}
                    </b>
                    .
                </>
            );
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
                showThemedMessage(
                    'Assistive Technology Version already being used',
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
                    </>,
                    theme
                );
            } else {
                onThemedModalClose();
                await triggerLoad(async () => {
                    await triggerUpdate();
                }, 'Removing Assistive Technology Version');

                // Show confirmation that AT has been deleted
                showFeedbackMessage(
                    'Successfully Removed Assistive Technology Version',
                    <>
                        Successfully removed version for{' '}
                        <b>{selectedAt.name}</b>.
                    </>
                );

                // Reset atVersion to valid existing item
                setSelectedManageAtVersionId(selectedAt.atVersions[0]?.id);
            }
        }
    };

    const showFeedbackMessage = (title, content) => {
        setFeedbackModalTitle(title);
        setFeedbackModalContent(content);
        setShowFeedbackModal(true);
    };

    const showThemedMessage = (title, content, theme) => {
        setThemedModalTitle(title);
        setThemedModalContent(content);
        setThemedModalType(theme);
        setShowThemedModal(true);
    };

    const exactOrMinimumAtVersion = ats
        .find(item => item.id === selectedAtId)
        ?.atVersions.find(item => item.id === selectedReportAtVersionId);

    const selectedTestPlanVersion = allTestPlanVersions.find(
        ({ id }) => id === selectedTestPlanVersionId
    );

    return (
        <LoadingStatus message={loadingMessage}>
            <DisclosureComponent
                componentId="manage-test-queue"
                title={[
                    'Manage Assistive Technology Versions',
                    'Add Test Plans to the Test Queue'
                ]}
                disclosureContainerView={[
                    <DisclosureContainer key={`manage-test-queue-at-section`}>
                        <span>
                            Select an assistive technology and manage its
                            versions in the ARIA-AT App
                        </span>
                        <div className="disclosure-row-manage-ats">
                            <Form.Group className="ats-container form-group">
                                <Form.Label className="disclosure-form-label">
                                    Assistive Technology
                                </Form.Label>
                                <Form.Select
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
                                </Form.Select>
                            </Form.Group>
                            <div className="at-versions-container">
                                <Form.Group className="form-group">
                                    <Form.Label className="disclosure-form-label">
                                        Available Versions
                                    </Form.Label>
                                    <Form.Select
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
                                    </Form.Select>
                                </Form.Group>
                                <div className="disclosure-buttons-row">
                                    <button
                                        ref={addAtVersionButtonRef}
                                        onClick={() =>
                                            onOpenAtVersionModalClick('add')
                                        }
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
                    </DisclosureContainer>,
                    <DisclosureContainer
                        key={`manage-test-queue-add-test-plans-section`}
                    >
                        <span>
                            Select a test plan, assistive technology and browser
                            to add a new test plan report to the test queue.
                        </span>
                        <div className="disclosure-row-test-plans">
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Test Plan
                                </Form.Label>
                                <Form.Select
                                    onChange={e => {
                                        const { value } = e.target;
                                        setShowMinimumAtVersionErrorMessage(
                                            false
                                        );
                                        setSelectedAtVersionExactOrMinimum(
                                            'Exact Version'
                                        );
                                        updateMatchingTestPlanVersions(
                                            value,
                                            allTestPlanVersions
                                        );
                                    }}
                                >
                                    {filteredTestPlanVersions.map(item => (
                                        <option
                                            key={`${
                                                item.title ||
                                                item.testPlan.directory
                                            }-${item.id}`}
                                            value={item.id}
                                        >
                                            {item.title ||
                                                `"${item.testPlan.directory}"`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Test Plan Version
                                </Form.Label>
                                <Form.Select
                                    value={
                                        selectedTestPlanVersionId
                                            ? selectedTestPlanVersionId
                                            : ''
                                    }
                                    onChange={onTestPlanVersionChange}
                                    disabled={!selectedTestPlanVersionId}
                                    aria-disabled={!selectedTestPlanVersionId}
                                >
                                    {matchingTestPlanVersions.length ? (
                                        matchingTestPlanVersions.map(item => (
                                            <option
                                                key={`${item.gitSha}-${item.id}`}
                                                value={item.id}
                                            >
                                                {gitUpdatedDateToString(
                                                    item.updatedAt
                                                )}{' '}
                                                {item.gitMessage} (
                                                {item.gitSha.substring(0, 7)})
                                            </option>
                                        ))
                                    ) : (
                                        <option>
                                            Versions in R&D or Deprecated
                                        </option>
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <div>{/* blank grid cell */}</div>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Assistive Technology
                                </Form.Label>
                                <Form.Select
                                    value={selectedAtId}
                                    onChange={onAtChange}
                                >
                                    <option value={''} disabled>
                                        Select an Assistive Technology
                                    </option>
                                    {ats.map(item => (
                                        <option
                                            key={`${item.name}-${item.id}`}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Assistive Technology Version
                                </Form.Label>
                                <div className="form-group-at-version">
                                    <RadioBox
                                        name="atVersion"
                                        labels={[
                                            'Exact Version',
                                            'Minimum Version'
                                        ]}
                                        selectedLabel={
                                            selectedAtVersionExactOrMinimum
                                        }
                                        onSelect={exactOrMinimum => {
                                            if (
                                                selectedTestPlanVersion?.phase ===
                                                    'RECOMMENDED' &&
                                                exactOrMinimum ===
                                                    'Minimum Version'
                                            ) {
                                                setShowMinimumAtVersionErrorMessage(
                                                    true
                                                );
                                                return;
                                            }

                                            setSelectedAtVersionExactOrMinimum(
                                                exactOrMinimum
                                            );
                                        }}
                                    />
                                    <Form.Select
                                        value={selectedReportAtVersionId ?? ''}
                                        onChange={onReportAtVersionIdChange}
                                        disabled={!selectedAtId}
                                    >
                                        <option value={''} disabled>
                                            Select AT Version
                                        </option>
                                        {ats
                                            .find(at => at.id === selectedAtId)
                                            ?.atVersions.map(item => (
                                                <option
                                                    key={`${item.name}-${item.id}`}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                    </Form.Select>
                                    {showMinimumAtVersionErrorMessage &&
                                    selectedTestPlanVersion?.phase ===
                                        'RECOMMENDED' ? (
                                        <div role="alert">
                                            The selected test plan version is in
                                            the recommended phase and only exact
                                            versions can be chosen.
                                        </div>
                                    ) : null}
                                </div>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Browser
                                </Form.Label>
                                <Form.Select
                                    value={selectedBrowserId}
                                    onChange={onBrowserChange}
                                    disabled={!selectedAtId}
                                >
                                    <option value={''} disabled>
                                        Select a Browser
                                    </option>
                                    {ats
                                        .find(at => at.id === selectedAtId)
                                        ?.browsers.map(item => (
                                            <option
                                                key={`${item.name}-${item.id}`}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <AddTestToQueueWithConfirmation
                            testPlanVersion={allTestPlanVersions.find(
                                item => item.id === selectedTestPlanVersionId
                            )}
                            at={ats.find(item => item.id === selectedAtId)}
                            exactAtVersion={
                                selectedAtVersionExactOrMinimum ===
                                'Exact Version'
                                    ? exactOrMinimumAtVersion
                                    : null
                            }
                            minimumAtVersion={
                                selectedAtVersionExactOrMinimum ===
                                'Minimum Version'
                                    ? exactOrMinimumAtVersion
                                    : null
                            }
                            browser={ats
                                .find(at => at.id === selectedAtId)
                                ?.browsers.find(
                                    browser => browser.id === selectedBrowserId
                                )}
                            triggerUpdate={triggerUpdate}
                            disabled={
                                !selectedTestPlanVersionId ||
                                !selectedAtId ||
                                !selectedReportAtVersionId ||
                                !selectedBrowserId
                            }
                        />
                    </DisclosureContainer>
                ]}
                onClick={[onManageAtsClick, onAddTestPlansClick]}
                expanded={[showManageATs, showAddTestPlans]}
                stacked
            />

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
        </LoadingStatus>
    );
};

ManageTestQueue.propTypes = {
    ats: PropTypes.array,
    testPlanVersions: PropTypes.array,
    triggerUpdate: PropTypes.func
};

export default ManageTestQueue;
