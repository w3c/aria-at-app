import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { DisclosureContainer } from '@components/ManageTestQueue/index';
import BasicModal from '@components/common/BasicModal';
import UpdateVersionModal from '@components/common/UpdateVersionModal';
import { convertStringToDate } from '@client/utils/formatter';
import { useMutation } from '@apollo/client';
import {
  ADD_AT_VERSION_MUTATION,
  DELETE_AT_VERSION_MUTATION,
  EDIT_AT_VERSION_MUTATION
} from '@components/TestQueue/queries';
import { useTriggerLoad } from '@components/common/LoadingStatus';
import { THEMES, useThemedModal } from '@client/hooks/useThemedModal';
import PropTypes from 'prop-types';

const ManageAtVersions = ({ ats = [], triggerUpdate = () => {} }) => {
  const { triggerLoad } = useTriggerLoad();
  const {
    themedModal,
    showThemedModal,
    setShowThemedModal,
    setThemedModalTitle,
    setThemedModalContent,
    setThemedModalType,
    setThemedModalActions,
    setThemedModalShowCloseAction,
    focus,
    setFocusRef,
    hideThemedModal
  } = useThemedModal({
    type: THEMES.WARNING,
    title: 'Error Updating Assistive Technology Version'
  });

  const loadedAts = useRef(false);

  const [selectedAtId, setSelectedAtId] = useState('1');
  const [selectedAtVersions, setSelectedAtVersions] = useState([]);
  const [selectedAtVersionId, setSelectedAtVersionId] = useState('');

  const [addAtVersion] = useMutation(ADD_AT_VERSION_MUTATION);
  const [editAtVersion] = useMutation(EDIT_AT_VERSION_MUTATION);
  const [deleteAtVersion] = useMutation(DELETE_AT_VERSION_MUTATION);

  // Update modal state values
  const [showUpdateVersionModal, setShowUpdateVersionModal] = useState(false);
  const [updateVersionModalTitle, setUpdateVersionModalTitle] = useState('');
  const [updateVersionModalType, setUpdateVersionModalType] = useState('add');
  const [updateVersionModalVersionText, setUpdateVersionModalVersionText] =
    useState('');
  const [updateVersionModalModalDateText, setUpdateVersionModalModalDateText] =
    useState('');

  // Feedback modal state values
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalTitle, setFeedbackModalTitle] = useState('');
  const [feedbackModalContent, setFeedbackModalContent] = useState(<></>);

  useEffect(() => {
    if (ats.length) {
      if (!loadedAts.current) setSelectedAtId(ats[0].id);

      // Required during refetch logic around managing AT Versions
      if (!loadedAts.current) setSelectedAtVersions(ats[0].atVersions);
      else {
        setSelectedAtVersions(
          ats.find(item => item.id === selectedAtId).atVersions
        );
      }

      if (!loadedAts.current) setSelectedAtVersionId(ats[0]?.atVersions[0]?.id);
      loadedAts.current = true;
    }
  }, [ats]);

  const getAtVersionFromId = id =>
    selectedAtVersions.find(item => id === item.id);

  const showThemedMessage = ({
    title,
    content,
    theme,
    actions = null,
    showCloseAction = false
  }) => {
    setThemedModalTitle(title);
    setThemedModalContent(content);
    setThemedModalType(theme);
    setThemedModalActions(actions);
    setThemedModalShowCloseAction(showCloseAction);
    setShowThemedModal(true);
  };

  const showFeedbackMessage = (title, content) => {
    setFeedbackModalTitle(title);
    setFeedbackModalContent(content);
    setShowFeedbackModal(true);
  };

  const onAtChange = e => {
    const { value } = e.target;
    if (selectedAtId !== value) {
      setSelectedAtId(value);
      const at = ats.find(item => item.id === value);
      setSelectedAtVersions(at.atVersions);
      setSelectedAtVersionId(at.atVersions[0].id);
    }
  };

  const onAtVersionChange = e => {
    const { value } = e.target;
    setSelectedAtVersionId(value);
  };

  const onOpenAtVersionModalClick = type => {
    if (type === 'add') {
      const selectedAt = ats.find(item => item.id === selectedAtId);
      setUpdateVersionModalTitle(`Add a New Version for ${selectedAt.name}`);
      setUpdateVersionModalType('add');
      setUpdateVersionModalVersionText('');
      setUpdateVersionModalModalDateText('');
      setShowUpdateVersionModal(true);
    }

    if (type === 'edit') {
      const selectedAt = ats.find(item => item.id === selectedAtId);
      setUpdateVersionModalTitle(
        `Edit ${selectedAt.name} Version ${
          getAtVersionFromId(selectedAtVersionId)?.name
        }`
      );
      setUpdateVersionModalType('edit');
      setUpdateVersionModalVersionText(
        getAtVersionFromId(selectedAtVersionId)?.name
      );
      setUpdateVersionModalModalDateText(
        getAtVersionFromId(selectedAtVersionId)?.releasedAt
      );
      setShowUpdateVersionModal(true);
    }

    if (type === 'delete') {
      const theme = 'danger';

      const selectedAt = ats.find(item => item.id === selectedAtId);
      showThemedMessage({
        title: `Remove ${selectedAt.name} Version ${
          getAtVersionFromId(selectedAtVersionId)?.name
        }`,
        content: (
          <>
            You are about to remove{' '}
            <b>
              {selectedAt.name} Version{' '}
              {getAtVersionFromId(selectedAtVersionId)?.name}
            </b>{' '}
            from the ARIA-AT App.
          </>
        ),
        actions: [
          {
            text: 'Remove',
            action: () => onUpdateAtVersionAction('delete', {})
          }
        ],
        showCloseAction: true,
        theme
      });
    }
  };

  const onUpdateAtVersionAction = async (
    actionType,
    { updatedVersionText, updatedDateAvailabilityText }
  ) => {
    const selectedAt = ats.find(item => item.id === selectedAtId);

    if (actionType === 'add') {
      const existingAtVersion = selectedAtVersions.find(
        item => item.name.trim() === updatedVersionText.trim()
      );
      if (existingAtVersion) {
        setSelectedAtVersionId(existingAtVersion.id);

        onUpdateModalClose();
        showFeedbackMessage(
          'Existing Assistive Technology Version',
          <>
            <b>
              {selectedAt.name} {updatedVersionText}
            </b>{' '}
            already exists in the system. Please try adding a different one.
          </>
        );
        return;
      }

      onUpdateModalClose();
      await triggerLoad(async () => {
        const addAtVersionData = await addAtVersion({
          variables: {
            atId: selectedAtId,
            name: updatedVersionText,
            releasedAt: convertStringToDate(updatedDateAvailabilityText)
          }
        });
        setSelectedAtVersionId(
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
            atVersionId: selectedAtVersionId,
            name: updatedVersionText,
            releasedAt: convertStringToDate(updatedDateAvailabilityText)
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
          atVersionId: selectedAtVersionId
        }
      });
      if (!deleteAtVersionData.data?.atVersion?.deleteAtVersion?.isDeleted) {
        const patternName =
          deleteAtVersionData.data?.atVersion?.deleteAtVersion
            ?.failedDueToTestResults[0]?.testPlanVersion?.title;
        const theme = 'warning';

        // Removing an AT Version already in use
        showThemedMessage({
          title: 'Assistive Technology Version already being used',
          content: (
            <>
              <b>
                {selectedAt.name} Version{' '}
                {getAtVersionFromId(selectedAtVersionId)?.name}
              </b>{' '}
              can&apos;t be removed because it is already being used to test the{' '}
              <b>{patternName}</b> Test Plan.
            </>
          ),
          theme
        });
      } else {
        onThemedModalClose();

        await triggerLoad(async () => {
          await triggerUpdate();
        }, 'Removing Assistive Technology Version');

        // Show confirmation that AT has been deleted
        showFeedbackMessage(
          'Successfully Removed Assistive Technology Version',
          <>
            Successfully removed version for <b>{selectedAt.name}</b>.
          </>
        );

        // Reset atVersion to valid existing item
        setSelectedAtVersionId(selectedAt.atVersions[0]?.id);
      }
    }
  };

  const onUpdateModalClose = () => {
    setUpdateVersionModalVersionText('');
    setUpdateVersionModalModalDateText('');
    setShowUpdateVersionModal(false);
    focus();
  };

  const onThemedModalClose = () => {
    hideThemedModal();
    focus();
  };

  return (
    <>
      <DisclosureContainer>
        <span>
          Select an assistive technology and manage its versions in the ARIA-AT
          App
        </span>
        <div className="disclosure-row-manage-ats">
          <Form.Group className="ats-container form-group">
            <Form.Label className="disclosure-form-label">
              Assistive Technology
            </Form.Label>
            <Form.Select value={selectedAtId} onChange={onAtChange}>
              {ats
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(item => (
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
                value={selectedAtVersionId}
                onChange={onAtVersionChange}
              >
                {selectedAtVersions.map(item => (
                  <option
                    key={`${selectedAtId}-${item.id}-${item.name}`}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="disclosure-buttons-row">
              <button
                // ref={addAtVersionButtonRef}
                ref={ref => setFocusRef(ref)}
                onClick={() => onOpenAtVersionModalClick('add')}
              >
                Add a New Version
              </button>
              <button
                // ref={editAtVersionButtonRef}
                ref={ref => setFocusRef(ref)}
                onClick={() => onOpenAtVersionModalClick('edit')}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </button>
              <button
                // ref={deleteAtVersionButtonRef}
                ref={ref => setFocusRef(ref)}
                // onClick={onRemoveClick}
                onClick={() => onOpenAtVersionModalClick('delete')}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
                Remove
              </button>
            </div>
          </div>
        </div>
      </DisclosureContainer>

      {showThemedModal && themedModal}
      {showUpdateVersionModal && (
        <UpdateVersionModal
          show={showUpdateVersionModal}
          title={updateVersionModalTitle}
          actionType={updateVersionModalType}
          versionText={updateVersionModalVersionText}
          dateAvailabilityText={updateVersionModalModalDateText}
          handleAction={onUpdateAtVersionAction}
          handleClose={onUpdateModalClose}
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
          }}
        />
      )}
    </>
  );
};

ManageAtVersions.propTypes = {
  ats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      browsers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          key: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  triggerUpdate: PropTypes.func
};

export default ManageAtVersions;
