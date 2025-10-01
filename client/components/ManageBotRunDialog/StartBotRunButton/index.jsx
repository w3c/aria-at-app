import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useApolloClient } from '@apollo/client';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import useConfirmationModal from '../../../hooks/useConfirmationModal';
import { useTriggerLoad } from '../../common/LoadingStatus';
import BasicModal from '../../common/BasicModal';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from '../../AddTestToQueueWithConfirmation/queries';
import { TEST_QUEUE_PAGE_QUERY } from '../../TestQueue/queries';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '../../TestPlanReportStatusDialog/queries';

const StartBotRunButton = ({ testPlanReport, onChange }) => {
  const client = useApolloClient();
  const { triggerLoad } = useTriggerLoad();
  const { showConfirmationModal, hideConfirmationModal } =
    useConfirmationModal();
  // Synchronize the state of the action with the modal UI
  const [isActionPending, setIsActionPending] = useState(false);
  // Ref guard to prevent concurrent actions
  const isConfirmingRef = useRef(false);

  const atLatestAutomationSupportedVersion = useMemo(() => {
    const versions = testPlanReport?.at?.atVersions || [];
    const supported = versions.filter(v => v.supportedByAutomation);
    if (!supported.length) return null;
    return supported.reduce((latest, v) =>
      new Date(v.releasedAt) > new Date(latest.releasedAt) ? v : latest
    );
  }, [testPlanReport]);

  // Shorten the AT name to the first word
  // specifically needed for "VoiceOver for macOS"
  const shortenedAtName = useMemo(() => {
    return testPlanReport.at.name.split(' ')[0];
  }, [testPlanReport]);

  const onStart = () => {
    const title = `Start ${testPlanReport.at.name} Bot Run`;
    const content = (
      <>
        <p>
          This will run the bot using {testPlanReport.at.name}{' '}
          {atLatestAutomationSupportedVersion?.name ??
            '(no automation-supported version found)'}
          .
        </p>
      </>
    );

    const onConfirm = async () => {
      if (isConfirmingRef.current || isActionPending) return;
      isConfirmingRef.current = true;
      setIsActionPending(true);
      // Immediately reflect disabled/label in the modal UI
      showConfirmationModal(renderModal());
      try {
        await triggerLoad(async () => {
          await client.mutate({
            mutation: SCHEDULE_COLLECTION_JOB_MUTATION,
            variables: { testPlanReportId: testPlanReport.id },
            refetchQueries: [
              TEST_QUEUE_PAGE_QUERY,
              TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
            ],
            awaitRefetchQueries: true
          });
        }, 'Scheduling Collection Job');
        hideConfirmationModal();
        if (onChange) await onChange();
      } finally {
        setIsActionPending(false);
        isConfirmingRef.current = false;
      }
    };

    const renderModal = () => (
      <BasicModal
        show
        title={title}
        content={content}
        staticBackdrop={true}
        handleClose={() => hideConfirmationModal()}
        useOnHide={true}
        actions={[
          {
            label:
              isConfirmingRef.current || isActionPending
                ? 'Starting...'
                : 'Start',
            onClick: onConfirm,
            testId: 'confirm-start-bot-run',
            disabled: isConfirmingRef.current || isActionPending
          }
        ]}
      />
    );

    showConfirmationModal(renderModal());
  };

  return (
    <Button variant="secondary" onClick={onStart}>
      <FontAwesomeIcon icon={faFileImport} />
      {`Start ${shortenedAtName} Bot Run`}
    </Button>
  );
};

StartBotRunButton.propTypes = {
  testPlanReport: PropTypes.shape({
    id: PropTypes.string.isRequired,
    at: PropTypes.shape({
      name: PropTypes.string.isRequired,
      atVersions: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          releasedAt: PropTypes.string.isRequired,
          supportedByAutomation: PropTypes.bool
        })
      )
    }).isRequired
  }).isRequired,
  onChange: PropTypes.func
};

export default StartBotRunButton;
