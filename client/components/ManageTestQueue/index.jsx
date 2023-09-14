import React, { useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, Dropdown } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faTrashAlt,
    faUserPlus,
    faCheck,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import UpdateVersionModal from '../common/UpdateVersionModal';
import BasicThemedModal from '../common/BasicThemedModal';
import {
    ADD_AT_VERSION_MUTATION,
    EDIT_AT_VERSION_MUTATION,
    DELETE_AT_VERSION_MUTATION
} from '../TestQueue/queries';
import {
    CREATE_MANAGE_TEST_QUEUE_MUTATION,
    UPDATE_MANAGE_TEST_QUEUE_MUTATION,
    DELETE_MANAGE_TEST_QUEUE_MUTATION
} from './queries';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { convertStringToDate } from '../../utils/formatter';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { ThemeTable, ThemeTableHeader } from '../common/ThemeTable';
import PhasePill from '../common/PhasePill';
import { at } from 'lodash';

const ModalInnerSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
`;

const ModalSubtitleStyle = styled.h2`
    font-size: 0.8em;
    margin: 0;
    padding: 0;
`;

const Required = styled.span`
    color: #ce1b4c;

    :after {
        content: '*';
    }
`;

const TransparentButton = styled.button`
    border: none;
    background-color: transparent;
`;

const DisclosureContainer = styled.div`
    // Following directives are related to the ManageTestQueue component
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

    .disclosure-row-controls {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
        align-items: end;
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
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const loadedAts = useRef(false);
    const focusButtonRef = useRef();
    const addAtVersionButtonRef = useRef();
    const editAtVersionButtonRef = useRef();
    const deleteAtVersionButtonRef = useRef();

    // Find Manage Required Reports Modal
    const [showEditAtBrowserModal, setShowEditAtBrowserModal] = useState(true);
    const [requiredReportsModalAt, setRequiredReportsModalAt] = useState('');
    const [requiredReportsModalTitle, setRequiredReportsModalTitle] =
        useState('');

    const [isDelete, setIsDelete] = useState(false);
    const [actionButtonLabel, setActionButtonLabel] = useState('Save Changes');
    const [updateAtIdForUpdate, setUpdateAtIdForUpdate] = useState('');
    const [updatePhaseForUpdate, setUpdatePhaseForUpdate] = useState('');
    const [updateBrowserIdForUpdate, setUpdateBrowserIdForUpdate] =
        useState('');
    const [updateAtSelection, setUpdateAtSelection] = useState('Select an At');
    const [updateAtForButton, setUpdateAtForButton] = useState('');
    const [updateListAtSelection, setUpdateListAtSelection] =
        useState('Select an At');
    const [updateBrowserSelection, setUpdateBrowserSelection] =
        useState('Select a Browser');
    const [updateBrowserForButton, setUpdateBrowserForButton] =
        useState('Select a Browser');
    const [updateListBrowserSelection, setUpdateListBrowserSelection] =
        useState('Select a Browser');
    const [updatePhaseSelection, setUpdatePhaseSelection] =
        useState('Phase Selection');
    const [updatePhaseForButton, setUpdatePhaseForButton] = useState('');
    const [showManageATs, setShowManageATs] = useState(false);
    const [showAddTestPlans, setShowAddTestPlans] = useState(false);
    const [showManageReqReports, setShowManageReqReports] = useState(false);
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

    const [atBrowserCombinations, setAtBrowserCombinations] = useState([
        ...ats.flatMap(at =>
            at.candidateBrowsers.map(browser => ({
                at,
                browser,
                phase: 'CANDIDATE'
            }))
        ),
        ...ats.flatMap(at =>
            at.recommendedBrowsers.map(browser => ({
                at,
                browser,
                phase: 'RECOMMENDED'
            }))
        )
    ]);

    const toggleDivStyle = {
        backgroundColor: 'transparent',
        width: '100%',
        height: '38px',
        textAlign: 'center'
    };

    const togglePStyle = {
        border: '1px solid #ced4da',
        borderRadius: '0.375rem',
        backgroundColor: '#fff',
        padding: '2px',
        width: '100%',
        height: '38px',
        cursor: 'default',
        display: 'inline-block'
    };

    const toggleSpanStyle = {
        float: 'left',
        marginTop: '2px',
        marginLeft: '20px',
        backgroundColor:
            updatePhaseSelection === 'Phase Selection'
                ? '#fff'
                : updatePhaseSelection === 'Candidate'
                ? '#ff6c00'
                : updatePhaseSelection === 'Recommended'
                ? '#8441de'
                : 'black',
        borderRadius: '14px',
        padding: '2px 15px',
        fontSize: '1rem',
        fontWeight: '400',
        color: updatePhaseSelection === 'Phase Selection' ? 'black' : '#fff'
    };

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div
            style={toggleDivStyle}
            href=""
            ref={ref}
            onClick={e => {
                e.preventDefault();
                onClick(e);
            }}
        >
            <p
                style={togglePStyle}
                href=""
                ref={ref}
                onClick={e => {
                    e.preventDefault();
                    onClick(e);
                }}
            >
                <span style={toggleSpanStyle}>{children}</span>
                <span
                    style={{
                        float: 'right',
                        marginTop: '2px',
                        marginRight: '3px'
                    }}
                >
                    <FontAwesomeIcon
                        style={{ fontSize: '.8rem' }}
                        icon={faChevronDown}
                    />
                </span>
            </p>
        </div>
    ));

    const setPhase = phase => {
        setUpdatePhaseSelection(phase);
        if (phase === 'Candidate') {
            setUpdatePhaseForButton('CANDIDATE');
        }
        if (phase === 'Recommended') {
            setUpdatePhaseForButton('RECOMMENDED');
        }
    };
    const CustomMenu = React.forwardRef(
        (
            {
                children,
                style,
                onClick,
                className,
                'aria-labelledby': labeledBy
            },
            ref
        ) => {
            const [value, setValue] = useState('');

            return (
                <div
                    ref={ref}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <ul>
                        {React.Children.toArray(children).filter(
                            child =>
                                !value ||
                                child.props.children
                                    .toLowerCase()
                                    .startsWith(value)
                        )}
                    </ul>
                </div>
            );
        }
    );

    // let atBrowserCombinations = [
    //     ...ats.flatMap(at =>
    //         at.candidateBrowsers.map(browser => ({
    //             at,
    //             browser,
    //             phase: 'CANDIDATE'
    //         }))
    //     ),
    //     ...ats.flatMap(at =>
    //         at.recommendedBrowsers.map(browser => ({
    //             at,
    //             browser,
    //             phase: 'RECOMMENDED'
    //         }))
    //     )
    // ];

    // Section:

    const onOpenShowEditAtBrowserModal = (
        type = 'edit',
        phase,
        at = '',
        browser = ''
    ) => {
        if (type === 'edit') {
            setRequiredReportsModalTitle(
                <p>
                    Edit the following AT/Browser pair for{' '}
                    <PhasePill fullWidth={false} forHeader={true}>
                        {phase}
                    </PhasePill>{' '}
                    required reports
                </p>
            );
        }

        if (type === 'delete') {
            setRequiredReportsModalTitle(
                <p>
                    Delete {at} and {browser} pair for{' '}
                    <PhasePill fullWidth={false} forHeader={true}>
                        {phase}
                    </PhasePill>{' '}
                    required reports
                </p>
            );
        }
        setShowEditAtBrowserModal(false);
    };

    // Section:
    const runMutationForRequiredReportTable = async mutation => {
        let atId = updateAtForButton;
        let browserId = updateBrowserForButton;
        // console.log(atBrowserCombinations);

        mutation === 'createRequiredReport'
            ? await triggerLoad(async () => {
                  try {
                      atBrowserCombinations.forEach(
                          ({ at, browser, phase }) => {
                              // console.log('AtID', updateAtForButton)
                              // console.log('at.Id', at.id)
                              // console.log('BrowserID', updateBrowserForButton)
                              // console.log('browser.Id', browser.id)
                              if (
                                  updateAtForButton === at.id &&
                                  updateBrowserForButton === browser.id &&
                                  updatePhaseForButton === phase
                              ) {
                                  // atId = at.id;
                                  // browserId = browser.id;
                                  // console.log('IT CHECKED OUT');
                                  throw new Error(
                                      'A duplicate Entry was detected in the table'
                                  );
                              }
                          }
                      );
                      const { data } = await createRequiredReport({
                          variables: {
                              atId: atId,
                              browserId: browserId,
                              phase: `IS_${updatePhaseForButton}`
                          }
                      });
                      //   console.log('data', data);

                      const createdRequiredReport =
                          data.requiredReport.createRequiredReport;

                      // Verify that the created required report was actually created before updating
                      // the dataset
                      if (createdRequiredReport) {
                          setAtBrowserCombinations(
                              [
                                  ...atBrowserCombinations,
                                  {
                                      at: ats.find(
                                          at =>
                                              at.id ===
                                              createdRequiredReport.atId
                                      ),
                                      browser: browsers.find(
                                          browser =>
                                              browser.id ===
                                              createdRequiredReport.browserId
                                      ),
                                      phase: updatePhaseForButton
                                  }
                              ].sort((a, b) => {
                                  if (a.phase < b.phase) return -1;
                                  if (a.phase > b.phase) return 1;
                                  return a.at.name.localeCompare(b.at.name);
                              })
                          );
                      }
                  } catch (error) {
                      console.error(error);
                  }
              }, 'Adding Phase requirement to the required reports table')
            : mutation === 'updateRequiredReport'
            ? await triggerLoad(async () => {
                  //   console.log(
                  //       'Update IDS',
                  //       updateBrowserSelection,
                  //       updateAtSelection
                  //   );
                  //   console.log(
                  //       'phase in title',
                  //       requiredReportsModalTitle.props.children[2].props.children
                  //   );
                  try {
                      atBrowserCombinations.forEach(
                          ({ at, browser, phase }) => {
                              // console.log('AtID', updateAtForButton)
                              // console.log('at.Id', at.id)
                              // console.log('BrowserID', updateBrowserForButton)
                              // console.log('browser.Id', browser.id)
                              if (
                                  updateAtSelection === at.id &&
                                  updateBrowserSelection === browser.id &&
                                  updatePhaseForUpdate === phase
                              ) {
                                  // atId = at.id;
                                  // browserId = browser.id;
                                  // console.log('IT CHECKED OUT');
                                  throw new Error(
                                      'A duplicate Entry was detected in the table'
                                  );
                              }
                          }
                      );
                      //   console.log('updateAt', updateAtIdForUpdate);
                      //   console.log('updateBrowser', updateBrowserIdForUpdate);

                      const { data } = await updateRequiredReport({
                          variables: {
                              atId: updateAtIdForUpdate,
                              browserId: updateBrowserIdForUpdate,
                              //   phase: `IS_${updatePhaseForButton}`,
                              phase: `IS_${updatePhaseForUpdate}`,
                              updateAtId: updateAtSelection,
                              updateBrowserId: updateBrowserSelection
                          }
                      });
                      //   console.log('data', data);

                      const updatedRequiredReport =
                          data.requiredReport.updateRequiredReport;

                      // Verify that the created required report was actually created before updating
                      // the dataset
                      if (updatedRequiredReport) {
                          setAtBrowserCombinations(
                              [
                                  ...atBrowserCombinations,
                                  {
                                      at: ats.find(
                                          at =>
                                              at.id ===
                                              updatedRequiredReport.atId
                                      ),
                                      browser: browsers.find(
                                          browser =>
                                              browser.id ===
                                              updatedRequiredReport.browserId
                                      ),
                                      phase: updatePhaseForUpdate
                                  }
                              ]
                                  .filter(row => {
                                      if (
                                          row.at.id === updateAtIdForUpdate &&
                                          row.browser.id ===
                                              updateBrowserIdForUpdate &&
                                          row.phase == updatePhaseForUpdate
                                      ) {
                                          // foundOne80 = true; // Set the flag to true to filter out only the first object with score 80
                                          return false; // Exclude this object from the filtered result
                                      }
                                      return true; // Keep all other objects
                                  })
                                  .sort((a, b) => {
                                      if (a.phase < b.phase) return -1;
                                      if (a.phase > b.phase) return 1;
                                      return a.at.name.localeCompare(b.at.name);
                                  })
                          );
                      }
                  } catch (error) {
                      console.error(error);
                  }
              }, 'Adding Phase requirement to the required reports table')
            : mutation === 'deleteRequiredReport'
            ? await triggerLoad(async () => {
                console.log('atId', updateAtIdForUpdate)
                console.log('browserId', updateBrowserIdForUpdate)
                  const { data } = await deleteRequiredReport({
                      variables: {
                          atId: updateAtIdForUpdate,
                          browserId: updateBrowserIdForUpdate,
                          phase: `IS_${updatePhaseForUpdate}`
                      }
                  });
                  //   console.log('data', data);

                  const deletedRequiredReport =
                      data.requiredReport.deleteRequiredReport;

                  if (deletedRequiredReport) {
                      setAtBrowserCombinations(
                          [
                              ...atBrowserCombinations
                              //   {
                              //       at: ats.find(
                              //           at => at.id === deletedRequiredReport.atId
                              //       ),
                              //       browser: browsers.find(
                              //           browser =>
                              //               browser.id ===
                              //               deletedRequiredReport.browserId
                              //       ),
                              //       phase: updatePhaseForUpdate
                              //   }
                          ]
                              .filter(row => {
                                  if (
                                      row.at.id === updateAtIdForUpdate &&
                                      row.browser.id ===
                                          updateBrowserIdForUpdate &&
                                      row.phase == updatePhaseForUpdate
                                  ) {
                                      return false;
                                  }
                                  return true;
                              })
                              .sort((a, b) => {
                                  if (a.phase < b.phase) return -1;
                                  if (a.phase > b.phase) return 1;
                                  return a.at.name.localeCompare(b.at.name);
                              })
                      );
                  }
              }, 'Adding Phase requirement to the required reports table')
            : null;
    };

    const addRequiredReport = async () => {
        //    console.log('The at', updateAtForButton);
        //    console.log('The browser', updateBrowserForButton);
        //    console.log('The phase', updatePhaseForButton);
        // let atId = '';
        // let browserId = '';

        // atBrowserCombinations.forEach(({ at, browser, phase }) => {
        //     // console.log('The at', at.id);
        //     // console.log('The at Update', updateAtForButton);
        //     // console.log('The browser', browser.id);
        //     // console.log('The browser Update', updateBrowserForButton);
        //     // console.log('The phase', phase);
        //     // console.log('The phase Update', updatePhaseForButton);
        //     if (
        //         updateAtForButton === at.id &&
        //         updateBrowserForButton === browser.id
        //         // updatePhaseForButton === phase
        //     ) {
        //         atId = at.id;
        //         browserId = browser.id;
        //         // console.log('IT CHECKED OUT');
        //     }
        // });
        await triggerLoad(async () => {
            await createRequiredReport({
                variables: {
                    atId: atId,
                    browserId: browserId,
                    phase: `IS_${updatePhaseForButton}`
                }
            });
        }, 'Adding Phase requirement to the required reports table');
        // setShowConfirmation(true);
    };

    // const changeRequiredReport = async () => {
    //     atBrowserCombinations.forEach(({ at, browser, phase }) => {
    //         // console.log('The at', at.id);
    //         // console.log('The at Update', updateAtForButton);
    //         // console.log('The browser', browser.id);
    //         // console.log('The browser Update', updateBrowserForButton);
    //         // console.log('The phase', phase);
    //         // console.log('The phase Update', updatePhaseForButton);
    //         if (
    //             updateAtForButton === at.id &&
    //             updateBrowserForButton === browser.id
    //             // updatePhaseForButton === phase
    //         ) {
    //             atId = at.id;
    //             browserId = browser.id;
    //             // console.log('IT CHECKED OUT');
    //         }
    //     });
    //     await triggerLoad(async () => {
    //         await createRequiredReport({
    //             variables: {
    //                 atId: atId,
    //                 browserId: browserId,
    //                 phase: `IS_${updatePhaseForButton}`
    //             }
    //         });
    //     }, 'Updating the required reports table');
    // };
    // addRequiredReport();

    const [addAtVersion] = useMutation(ADD_AT_VERSION_MUTATION);
    const [editAtVersion] = useMutation(EDIT_AT_VERSION_MUTATION);
    const [deleteAtVersion] = useMutation(DELETE_AT_VERSION_MUTATION);
    const [createRequiredReport] = useMutation(
        CREATE_MANAGE_TEST_QUEUE_MUTATION
    );
    const [updateRequiredReport] = useMutation(
        UPDATE_MANAGE_TEST_QUEUE_MUTATION
    );
    const [deleteRequiredReport] = useMutation(
        DELETE_MANAGE_TEST_QUEUE_MUTATION
    );

    const onManageAtsClick = () => setShowManageATs(!showManageATs);
    const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);
    const onManageReqReportsClick = () =>
        setShowManageReqReports(!showManageReqReports);

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
                        retrievedTestPlan.testPlan.directory
            )
            .sort((a, b) =>
                new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1
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

    // IMPORTED PHASE FUNCTION DEFINITIONS
    // const addPhaseRequirementToTable = async () => {
    //     await triggerLoad(async () => {
    //         await createRequiredReport({
    //             variables: {
    //                 atId: at.id,
    //                 browserId: browser.id,
    //                 phase: at.phase
    //             }
    //         });
    //     }, 'Adding Phase requirement to the required reports table');
    //     // setShowConfirmation(true);
    // };

    // DELET_MANAGE_TEST_QUEUE_MUTATION,
    // UPDATE_MANAGE_TEST_QUEUE_MUTATION

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

    // Find Manage Required Reports Modal
    // const onOpenShowEditAtBrowserModal = (type = 'edit', phase) => {
    //     if (type === 'edit') {
    //         setRequiredReportsModalTitle(
    //             <p>
    //                 Edit the following AT/Browser pair for{' '}
    //                 <PhasePill fullWidth={false} forHeader={true}>
    //                     {phase}
    //                 </PhasePill>{' '}
    //                 requied reports
    //             </p>
    //         );
    //     }

    //     if (type === 'delete') {
    //         setRequiredReportsModalTitle(<p>delete this</p>);
    //     }
    //     setShowEditAtBrowserModal(false);
    // };

    const handlePhaseChange = e => {
        const value = e.target.value;
        setUpdatePhaseSelection(value);
    };

    const handleAtChange = e => {
        const value = e.target.value;
        setUpdateAtSelection(value);
    };

    const handleBrowserChange = e => {
        const value = e.target.value;
        setUpdateBrowserSelection(value);
    };

    const handleListAtChange = e => {
        const value = e.target.value;
        setUpdateListAtSelection(value);
        setUpdateAtForButton(value);
        // console.log('value for at change', value);
        // console.log('updateAtForButton', updateAtForButton);
    };

    const handleListBrowserChange = e => {
        const value = e.target.value;
        setUpdateListBrowserSelection(value);
        setUpdateBrowserForButton(value);
        // console.log('value for browser change', value);
        // console.log('updateBrowserForButton', updateBrowserForButton);
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <DisclosureComponent
                componentId="manage-test-queue"
                title={[
                    'Manage Assistive Technology Versions',
                    'Add Test Plans to the Test Queue',
                    'Manage Required Reports'
                ]}
                disclosureContainerView={[
                    <DisclosureContainer key={`manage-test-queue-at-section`}>
                        <span>
                            Select an Assistive Technology and manage its
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
                            Select a Test Plan and version and an Assistive
                            Technology and Browser to add it to the Test Queue
                        </span>
                        <div className="disclosure-row-controls">
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Test Plan
                                </Form.Label>
                                <Form.Select
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
                                    value={selectedTestPlanVersionId}
                                    onChange={onTestPlanVersionChange}
                                >
                                    {matchingTestPlanVersions.map(item => (
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
                                    ))}
                                </Form.Select>
                            </Form.Group>
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
                                    Browser
                                </Form.Label>
                                <Form.Select
                                    value={selectedBrowserId}
                                    onChange={onBrowserChange}
                                >
                                    <option value={''} disabled>
                                        Select a Browser
                                    </option>
                                    {browsers.map(item => (
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
                            browser={browsers.find(
                                item => item.id === selectedBrowserId
                            )}
                            triggerUpdate={triggerUpdate}
                            disabled={
                                !selectedTestPlanVersionId ||
                                !selectedAtId ||
                                !selectedBrowserId
                            }
                        />
                    </DisclosureContainer>,
                    <DisclosureContainer
                        key={`manage-test-queue-required-reports`}
                    >
                        <span>
                            Add required reports for a specific AT and Browser
                            pair
                        </span>
                        {/* section: */}
                        <div className="disclosure-row-controls">
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Phase
                                </Form.Label>
                                <Dropdown>
                                    <Dropdown.Toggle
                                        as={CustomToggle}
                                        id="dropdown-custom-components"
                                    >
                                        {updatePhaseSelection}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        className="drop-down-div"
                                        as={CustomMenu}
                                    >
                                        {/* <option>New Option</option> */}
                                        <Dropdown.Item
                                            className="phase-option"
                                            eventKey="1"
                                            onClick={() =>
                                                setPhase('Candidate')
                                            }
                                        >
                                            Candidate
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            className="phase-option"
                                            eventKey="2"
                                            onClick={() =>
                                                setPhase('Recommended')
                                            }
                                        >
                                            Recommended
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Assistive Technology
                                </Form.Label>
                                {updateListAtSelection === 'Select an At' ? (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListAtSelection}
                                        onChange={handleListAtChange}
                                        // isInvalid={isAtVersionError}
                                        required
                                    >
                                        <option>Select an At</option>
                                        {ats.map(item => {
                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                        {/* <option value="JAWS">JAWS</option>
                                        <option value="NVDA">NVDA</option>
                                        <option value="VoiceOver for macOs">
                                            VoiceOver for macOs
                                        </option> */}
                                    </Form.Select>
                                ) : (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListAtSelection}
                                        onChange={handleListAtChange}
                                        // isInvalid={isAtVersionError}
                                        required
                                    >
                                        {/* {Object.entries(ats).map(
                                            ([key, value]) => {
                                                return (
                                                    <option
                                                        key={key}
                                                        value={value.name}
                                                        disabled={
                                                            key ===
                                                            'Select a Version'
                                                        }
                                                    >
                                                        {value.name}
                                                    </option>
                                                );
                                            }
                                        )} */}

                                        {ats.map(item => {
                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                )}
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label className="disclosure-form-label">
                                    Browser
                                </Form.Label>
                                {updateListAtSelection === 'Select an At' ? (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListBrowserSelection}
                                        onChange={handleListBrowserChange}
                                        disabled
                                        // isInvalid={isAtVersionError}
                                        required
                                    ></Form.Select>
                                ) : updateListAtSelection === '1' ? (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListBrowserSelection}
                                        onChange={handleListBrowserChange}
                                        // isInvalid={isAtVersionError}
                                        required
                                    >
                                        {' '}
                                        <option>Select a browser</option>
                                        {/* {Object.entries(ats[0].browsers).map(
                                            ([key, value]) => {
                                                return (
                                                    <option key={key}>
                                                        {value.name}
                                                    </option>
                                                );
                                            }
                                        )}{' '} */}
                                        {ats[0].browsers.map(item => {
                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                ) : updateListAtSelection === '2' ? (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListBrowserSelection}
                                        onChange={handleListBrowserChange}
                                        // isInvalid={isAtVersionError}
                                        required
                                    >
                                        <option>Select a browser</option>
                                        {/* {Object.entries(ats[1].browsers).map(
                                            ([key, value]) => {
                                                return (
                                                    <option key={key}>
                                                        {value.name}
                                                    </option>
                                                );
                                            }
                                        )}{' '} */}
                                        {ats[1].browsers.map(item => {
                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                ) : updateListAtSelection === '3' ? (
                                    <Form.Select
                                        // ref={updatedAtVersionDropdownRef}
                                        // value={updatedAtVersion}
                                        value={updateListBrowserSelection}
                                        onChange={handleListBrowserChange}
                                        // isInvalid={isAtVersionError}
                                        required
                                    >
                                        <option>Select a browser</option>
                                        {/* {Object.entries(ats[2].browsers).map(
                                            ([key, value]) => {
                                                return (
                                                    <option key={key}>
                                                        {value.name}
                                                    </option>
                                                );
                                            }
                                        )}{' '} */}
                                        {ats[2].browsers.map(item => {
                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                ) : null}
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Button
                                    // ref={addTestPlanReportButtonRef}
                                    // variant="primary"
                                    // disabled={
                                    //     !selectedTestPlanVersionId ||
                                    //     !selectedAtId ||
                                    //     !selectedBrowserId
                                    // }
                                    // onClick={addRequiredReport}
                                    onClick={() => {
                                        runMutationForRequiredReportTable(
                                            'createRequiredReport'
                                        );
                                    }}
                                >
                                    Add Required Reports
                                </Button>
                            </Form.Group>
                        </div>
                        <ThemeTableHeader>Required Reports</ThemeTableHeader>
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
                                {atBrowserCombinations.map(
                                    ({ at, browser, phase }) => {
                                        return (
                                            <tr
                                                key={`${at.id}-${browser.id}-${phase}`}
                                            >
                                                <td>
                                                    <PhasePill
                                                        fullWidth={false}
                                                    >
                                                        {phase}
                                                    </PhasePill>{' '}
                                                </td>
                                                <td>{at.name}</td>
                                                <td>{browser.name}</td>
                                                <td>
                                                    <TransparentButton>
                                                        <FontAwesomeIcon
                                                            icon={faEdit}
                                                            color="#818F98"
                                                            onClick={() => {
                                                                setIsDelete(
                                                                    false
                                                                );
                                                                setActionButtonLabel(
                                                                    'Save Changes'
                                                                );
                                                                setUpdateAtIdForUpdate(
                                                                    at.id
                                                                );
                                                                setUpdateBrowserIdForUpdate(
                                                                    browser.id
                                                                );
                                                                setUpdatePhaseForUpdate(
                                                                    phase
                                                                );
                                                                setRequiredReportsModalAt(
                                                                    phase
                                                                );
                                                                onOpenShowEditAtBrowserModal(
                                                                    'edit',
                                                                    phase
                                                                );
                                                            }}
                                                        />
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                    </TransparentButton>
                                                    <TransparentButton>
                                                        <FontAwesomeIcon
                                                            icon={faTrashAlt}
                                                            color="#ce1b4c"
                                                            onClick={() => {
                                                                setIsDelete(
                                                                    true
                                                                );
                                                                setActionButtonLabel(
                                                                    'Confirm Delete'
                                                                );
                                                                setUpdateAtIdForUpdate(
                                                                    at.id
                                                                );
                                                                setUpdateBrowserIdForUpdate(
                                                                    browser.id
                                                                );
                                                                setUpdatePhaseForUpdate(
                                                                    phase
                                                                );
                                                                onOpenShowEditAtBrowserModal(
                                                                    'delete',
                                                                    phase,
                                                                    at.name,
                                                                    browser.name
                                                                );
                                                            }}
                                                        />
                                                        <span className="sr-only">
                                                            Remove
                                                        </span>
                                                    </TransparentButton>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </ThemeTable>
                    </DisclosureContainer>
                ]}
                onClick={[
                    onManageAtsClick,
                    onAddTestPlansClick,
                    onManageReqReportsClick
                ]}
                expanded={[
                    showManageATs,
                    showAddTestPlans,
                    showManageReqReports
                ]}
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
            {/* {!showEditAtBrowserModal && */}
            {!showEditAtBrowserModal && (
                <BasicModal
                    show={true}
                    // closeButton={true}
                    closeButton={true}
                    cancelButton={true}
                    headerSep={true}
                    title={requiredReportsModalTitle}
                    dialogClassName="modal-50w"
                    content={
                        <ModalInnerSectionContainer>
                            {!isDelete ? (
                                <Row>
                                    <Form.Group className="form-group">
                                        <Form.Label>
                                            Assistive Technology
                                        </Form.Label>

                                        {updateAtSelection ===
                                        'Select an At' ? (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                value={updateAtSelection}
                                                onChange={handleAtChange}
                                                // isInvalid={isAtVersionError}
                                                required
                                            >
                                                <option>Select an At</option>
                                                <option value={1}>JAWS</option>
                                                <option value={2}>NVDA</option>
                                                <option value={3}>
                                                    VoiceOver for macOs
                                                </option>
                                            </Form.Select>
                                        ) : (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                value={updateAtSelection}
                                                onChange={handleAtChange}
                                                // isInvalid={isAtVersionError}
                                                required
                                            >
                                                {Object.entries(ats).map(
                                                    ([key, value]) => {
                                                        return (
                                                            <option
                                                                key={key}
                                                                value={value.id}
                                                                disabled={
                                                                    key ===
                                                                    'Select a Version'
                                                                }
                                                            >
                                                                {value.name}
                                                            </option>
                                                        );
                                                    },
                                                    {}
                                                )}
                                            </Form.Select>
                                        )}
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>
                                            Browser
                                            {/* <Required aria-hidden /> */}
                                        </Form.Label>

                                        {updateAtSelection ===
                                        'Select an At' ? (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                value={updateBrowserSelection}
                                                onChange={handleBrowserChange}
                                                disabled
                                                // isInvalid={isAtVersionError}
                                                required
                                            ></Form.Select>
                                        ) : updateAtSelection === '1' ? (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                value={updateBrowserSelection}
                                                onChange={handleBrowserChange}
                                                // isInvalid={isAtVersionError}
                                                required
                                            >
                                                {' '}
                                                <option>
                                                    Select a Browser
                                                </option>
                                                {Object.entries(
                                                    ats[0].browsers
                                                ).map(([key, value]) => {
                                                    return (
                                                        <option
                                                            key={key}
                                                            value={value.id}
                                                        >
                                                            {value.name}
                                                        </option>
                                                    );
                                                })}{' '}
                                            </Form.Select>
                                        ) : updateAtSelection === '2' ? (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                value={updateBrowserSelection}
                                                onChange={handleBrowserChange}
                                                // isInvalid={isAtVersionError}
                                                required
                                            >
                                                <option>
                                                    Select a Browser
                                                </option>
                                                {Object.entries(
                                                    ats[1].browsers
                                                ).map(([key, value]) => {
                                                    return (
                                                        <option
                                                            key={key}
                                                            value={value.id}
                                                        >
                                                            {value.name}
                                                        </option>
                                                    );
                                                })}{' '}
                                            </Form.Select>
                                        ) : updateAtSelection === '3' ? (
                                            <Form.Select
                                                // ref={updatedAtVersionDropdownRef}
                                                // value={updatedAtVersion}
                                                onChange={handleBrowserChange}
                                                value={updateBrowserSelection}
                                                // isInvalid={isAtVersionError}
                                                required
                                            >
                                                <option>
                                                    Select a Browser
                                                </option>
                                                {Object.entries(
                                                    ats[2].browsers
                                                ).map(([key, value]) => {
                                                    return (
                                                        <option
                                                            key={key}
                                                            value={value.id}
                                                        >
                                                            {value.name}
                                                        </option>
                                                    );
                                                })}{' '}
                                            </Form.Select>
                                        ) : null}
                                    </Form.Group>
                                </Row>
                            ) : null}
                        </ModalInnerSectionContainer>
                    }
                    actionLabel={actionButtonLabel}
                    //section:
                    handleAction={
                        // updatedAtVersion !== atVersion ||
                        // updatedBrowserVersion !== browserVersion
                        //     ? onSubmit
                        //     : handleClose
                        () => {
                            // console.log(
                            //     requiredReportsModalTitle.props.children[2]
                            //         .props.children
                            // );
                            if (actionButtonLabel === 'Save Changes') {
                                runMutationForRequiredReportTable(
                                    'updateRequiredReport'
                                );
                            }
                            if (actionButtonLabel === 'Confirm Delete') {
                                runMutationForRequiredReportTable(
                                    'deleteRequiredReport'
                                );
                            }
                            setShowEditAtBrowserModal(true);
                        }
                    }
                    handleClose={() => {
                        setUpdateAtSelection('Select an At');
                        setShowEditAtBrowserModal(true);
                    }}
                    handleHide={() => {
                        setUpdateAtSelection('Select an At');
                        setShowEditAtBrowserModal(true);
                    }}
                    staticBackdrop={true}
                />
            )}
        </LoadingStatus>
    );
};

ManageTestQueue.propTypes = {
    ats: PropTypes.array,
    browsers: PropTypes.array,
    testPlanVersions: PropTypes.array,
    triggerUpdate: PropTypes.func
};

export default ManageTestQueue;
