import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { useTriggerLoad } from '../LoadingStatus';
import styled from '@emotion/styled';
import PhasePill from '../PhasePill';
import { ThemeTable, ThemeTableHeaderH2 } from '../ThemeTable';
import { useMutation } from '@apollo/client';
import {
  CREATE_REQUIRED_REPORT_MUTATION,
  DELETE_REQUIRED_REPORT_MUTATION,
  UPDATE_REQUIRED_REPORT_MUTATION
} from '../../ManageTestQueue/queries';
import BasicThemedModal from '../BasicThemedModal';
import PropTypes from 'prop-types';
import { DisclosureContainer } from '../../ManageTestQueue';
import UpdateRequiredReportModal from './UpdateRequiredReportModal';
import DeleteRequiredReportModal from './DeleteRequiredReportModal';
import { AtPropType, BrowserPropType } from '../proptypes';
import { CreateRequiredReportForm } from './CreateRequiredReportForm';
import {
  filterAtBrowserCombinations,
  sortAtBrowserCombinations
} from './utils';

const TransparentButton = styled.button`
  border: none;
  background-color: transparent;
`;

const ManageRequiredReportsDisclosure = ({
  ats,
  browsers,
  triggerUpdate = () => {}
}) => {
  const { triggerLoad } = useTriggerLoad();

  const [pendingUpdateReport, setPendingUpdateReport] = useState(null);
  const [pendingDeleteReport, setPendingDeleteReport] = useState(null);

  const [modalState, setModalState] = useState({
    show: false,
    title: '',
    content: ''
  });

  const [createRequiredReport] = useMutation(CREATE_REQUIRED_REPORT_MUTATION);
  const [updateRequiredReport] = useMutation(UPDATE_REQUIRED_REPORT_MUTATION);
  const [deleteRequiredReport] = useMutation(DELETE_REQUIRED_REPORT_MUTATION);

  useEffect(() => {
    setAtBrowserCombinations(getAtBrowserCombos());
  }, [ats, browsers]);

  const showErrorModal = useCallback((title, message) => {
    setModalState({ show: true, title, content: <>{message}</> });
  }, []);

  const getAtBrowserCombos = () => {
    return [
      ...ats.flatMap(at =>
        at.candidateBrowsers?.map(browser => ({
          at,
          browser,
          phase: 'CANDIDATE'
        }))
      ),
      ...ats.flatMap(at =>
        at.recommendedBrowsers?.map(browser => ({
          at,
          browser,
          phase: 'RECOMMENDED'
        }))
      )
    ];
  };

  const [atBrowserCombinations, setAtBrowserCombinations] = useState(
    getAtBrowserCombos()
  );

  const updateAtBrowserCombinations = useCallback(
    (updatedReport, action) => {
      setAtBrowserCombinations(prevCombinations => {
        let newCombinations = [...prevCombinations];

        if (action === 'add') {
          newCombinations.push({
            at: ats.find(at => at.id === updatedReport.atId),
            browser: browsers.find(
              browser => browser.id === updatedReport.browserId
            ),
            phase: updatedReport.phase.replace('IS_', '')
          });
        }

        newCombinations = filterAtBrowserCombinations(
          newCombinations,
          updatedReport
        );
        return sortAtBrowserCombinations(newCombinations);
      });
    },
    [ats, browsers]
  );

  const handleRequiredReportAction = useCallback(
    async (action, actionData, mutationFn, successMessage) => {
      try {
        await triggerLoad(async () => {
          const { data } = await mutationFn({
            variables: {
              ...actionData,
              phase: actionData.phase
            }
          });

          const updatedReport = data.requiredReport[`${action}RequiredReport`];

          if (updatedReport) {
            updateAtBrowserCombinations(updatedReport, action);
          }

          await triggerUpdate();
        }, successMessage);
      } catch (error) {
        showErrorModal(
          `Error ${
            action.charAt(0).toUpperCase() + action.slice(1)
          }ing Required Report`,
          error.message
        );
      }
    },
    [triggerLoad, triggerUpdate, updateAtBrowserCombinations, showErrorModal]
  );

  const handleCreateRequiredReport = useCallback(
    createData =>
      handleRequiredReportAction(
        'create',
        { ...createData, phase: createData.phase.toUpperCase() },
        createRequiredReport,
        'Adding Phase requirement to the required reports table'
      ),
    [handleRequiredReportAction, createRequiredReport]
  );

  const handleDeleteReqReport = useCallback(
    deletionData => {
      handleRequiredReportAction(
        'delete',
        deletionData,
        deleteRequiredReport,
        'Deleting Phase requirement from the required reports table'
      ),
        handleCloseDeleteModal();
    },
    [handleRequiredReportAction, deleteRequiredReport, handleCloseDeleteModal]
  );

  const handleUpdateReport = useCallback(
    updateData => {
      handleRequiredReportAction(
        'update',
        updateData,
        updateRequiredReport,
        'Updating Phase requirement in the required reports table'
      ),
        handleCloseUpdateModal();
    },
    [handleRequiredReportAction, updateRequiredReport, handleCloseUpdateModal]
  );

  const handleCloseUpdateModal = () => {
    setPendingUpdateReport(null);
  };

  const handleCloseDeleteModal = () => {
    setPendingDeleteReport(null);
  };

  return (
    <>
      <DisclosureContainer data-testid="manage-required-reports-disclosure">
        <span>Add required reports for a specific AT and Browser pair</span>
        <CreateRequiredReportForm
          ats={ats}
          handleCreate={handleCreateRequiredReport}
        />
        <ThemeTableHeaderH2 style={{ padding: '1rem' }}>
          Required Reports
        </ThemeTableHeaderH2>
        <ThemeTable bordered responsive>
          <thead>
            <tr>
              <th>Phase</th>
              <th>AT</th>
              <th>Browser</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {atBrowserCombinations?.map(({ at, browser, phase }) => {
              return (
                <tr key={`${at.id}-${browser.id}-${phase}`}>
                  <td>
                    <PhasePill fullWidth={false} forHeader={true}>
                      {phase.toUpperCase()}
                    </PhasePill>
                  </td>
                  <td>{at.name}</td>
                  <td>{browser.name}</td>
                  <td>
                    <TransparentButton
                      className="edit-required-report-button"
                      onClick={() => {
                        setPendingUpdateReport({
                          atId: at.id,
                          browserId: browser.id,
                          phase: phase
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} color="#818F98" />
                      <span className="sr-only">Edit</span>
                    </TransparentButton>
                    <TransparentButton
                      className="delete-required-report-button"
                      onClick={() => {
                        setPendingDeleteReport({
                          at,
                          browser,
                          phase
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} color="#ce1b4c" />
                      <span className="sr-only">Remove</span>
                    </TransparentButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ThemeTable>
      </DisclosureContainer>
      {pendingUpdateReport && (
        <UpdateRequiredReportModal
          atId={pendingUpdateReport?.atId}
          browserId={pendingUpdateReport?.browserId}
          ats={ats}
          phase={pendingUpdateReport?.phase}
          handleClose={handleCloseUpdateModal}
          handleUpdate={handleUpdateReport}
        />
      )}
      {pendingDeleteReport && (
        <DeleteRequiredReportModal
          at={pendingDeleteReport?.at}
          browser={pendingDeleteReport?.browser}
          phase={pendingDeleteReport?.phase}
          handleClose={handleCloseDeleteModal}
          handleDeleteReqReport={handleDeleteReqReport}
        />
      )}
      <BasicThemedModal
        show={modalState.show}
        theme="warning"
        title={modalState.title}
        dialogClassName="modal-50w"
        content={modalState.content}
        actionButtons={[
          {
            text: 'Ok',
            action: () =>
              setModalState({ show: false, title: '', content: null })
          }
        ]}
        handleClose={() =>
          setModalState({ show: false, title: '', content: null })
        }
      />
    </>
  );
};

ManageRequiredReportsDisclosure.propTypes = {
  ats: PropTypes.arrayOf(AtPropType),
  browsers: PropTypes.arrayOf(BrowserPropType),
  triggerUpdate: PropTypes.func
};

export default ManageRequiredReportsDisclosure;
