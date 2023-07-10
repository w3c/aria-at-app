import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useMutation } from '@apollo/client';
import { UPDATE_TEST_PLAN_VERSION_PHASE } from '../queries';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';
import { convertDateToString } from '../../../utils/formatter';
import BasicThemedModal from '@components/common/BasicThemedModal';

const DataManagementRow = ({
    testPlan,
    testPlanVersions,
    testPlanReports,
    setTestPlanVersions
}) => {
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const [updateTestPlanVersionPhaseMutation] = useMutation(
        UPDATE_TEST_PLAN_VERSION_PHASE
    );

    // State
    const [activePhases, setActivePhases] = useState({});
    const [rdTestPlanVersions, setRdTestPlanVersions] = useState([]);
    const [draftTestPlanVersions, setDraftTestPlanVersions] = useState([]);
    const [candidateTestPlanVersions, setCandidateTestPlanVersions] = useState(
        []
    );
    const [recommendedTestPlanVersions, setRecommendedTestPlanVersions] =
        useState([]);

    // TODO: Make this into reusable component
    const [showThemedModal, setShowThemedModal] = useState(false);
    const [themedModalType, setThemedModalType] = useState('warning');
    const [themedModalTitle, setThemedModalTitle] = useState('');
    const [themedModalContent, setThemedModalContent] = useState(<></>);

    const showThemedMessage = (title, content, theme) => {
        setThemedModalTitle(title);
        setThemedModalContent(content);
        setThemedModalType(theme);
        setShowThemedModal(true);
    };

    const onThemedModalClose = () => {
        setShowThemedModal(false);

        // TODO: Identify focus point
        // someref.current.focus();
    };

    useEffect(() => {
        // TestPlanVersions separated by current TestPlan's phase
        setActivePhases({});
        setRdTestPlanVersions(
            testPlanVersions.filter(({ phase }) => phase === 'RD')
        );
        setDraftTestPlanVersions(
            testPlanVersions.filter(({ phase }) => phase === 'DRAFT')
        );
        setCandidateTestPlanVersions(
            testPlanVersions.filter(({ phase }) => phase === 'CANDIDATE')
        );
        setRecommendedTestPlanVersions(
            testPlanVersions.filter(({ phase }) => phase === 'RECOMMENDED')
        );
    }, [testPlanVersions]);

    // Get the version information based on the latest or earliest date info from a group of
    // TestPlanVersions
    const getVersionData = (
        testPlanVersions,
        { dateKey = 'updatedAt', isEarliest = false } = { dateKey: 'updatedAt' }
    ) => {
        if (isEarliest) {
            const earliestVersion = testPlanVersions.reduce((a, b) =>
                new Date(a[dateKey]) < new Date(b[dateKey]) ? a : b
            );
            const earliestVersionDate = earliestVersion[dateKey];
            return { earliestVersion, earliestVersionDate };
        } else {
            const latestVersion = testPlanVersions.reduce((a, b) =>
                new Date(a[dateKey]) > new Date(b[dateKey]) ? a : b
            );
            const latestVersionDate = latestVersion[dateKey];
            return {
                latestVersion,
                latestVersionDate: new Date(latestVersionDate)
            };
        }
    };

    const getUniqueAtObjects = testPlanReports => {
        const uniqueAtObjects = {};
        testPlanReports.forEach(testPlanReport => {
            const atId = testPlanReport.at.id;
            if (!uniqueAtObjects[atId]) {
                uniqueAtObjects[atId] = testPlanReport.at;
            }
        });
        return uniqueAtObjects;
    };

    const handleClickUpdateTestPlanVersionPhase = async (
        testPlanVersionId,
        phase,
        testPlanVersionToAdvanceWithData
    ) => {
        try {
            await triggerLoad(async () => {
                const result = await updateTestPlanVersionPhaseMutation({
                    variables: {
                        testPlanVersionId,
                        phase,
                        testPlanVersionIdDataToInclude:
                            testPlanVersionToAdvanceWithData?.id
                    }
                });

                const updatedTestPlanVersion =
                    result.data.testPlanVersion.updatePhase.testPlanVersion;
                setTestPlanVersions(prevTestPlanVersions => {
                    let testPlanVersions = [...prevTestPlanVersions];

                    const index = testPlanVersions.findIndex(
                        testPlanVersion =>
                            testPlanVersion.id === updatedTestPlanVersion.id
                    );
                    if (index !== -1)
                        testPlanVersions[index] = updatedTestPlanVersion;

                    return testPlanVersions;
                });
            }, 'Updating Test Plan Version Phase');
        } catch (e) {
            console.error(e.message);

            showThemedMessage(
                'Error Updating Test Plan Version Phase',
                <>{e.message}</>,
                'warning'
            );
        }
    };

    const renderCellForCoveredAts = () => {
        // return <button>3 Desktop Screen Readers</button>;

        const uniqueAtObjects = getUniqueAtObjects(testPlanReports);
        const atNames = Object.values(uniqueAtObjects).map(at => at.name);

        if (atNames.length > 1) {
            return (
                <>
                    {atNames.map((item, index) => (
                        <React.Fragment key={index}>
                            <b>{item}</b>
                            {index !== atNames.length - 1 ? (
                                index === atNames.length - 2 ? (
                                    <span> and </span>
                                ) : (
                                    <span>, </span>
                                )
                            ) : null}
                        </React.Fragment>
                    ))}
                </>
            );
        } else if (atNames.length === 1) return <b>{atNames[0]}</b>;
        else return <>N/A</>;
    };

    const renderCellForOverallStatus = () => {
        let view = <>N/A</>;

        if (recommendedTestPlanVersions.length) {
            const { earliestVersionDate } = getVersionData(
                recommendedTestPlanVersions,
                { dateKey: 'recommendedPhaseReachedAt', isEarliest: true }
            );
            return (
                <>
                    Recommended Since{' '}
                    {convertDateToString(earliestVersionDate, 'MMM D, YYYY')}
                </>
            );
        }

        if (candidateTestPlanVersions.length) {
            const { earliestVersionDate } = getVersionData(
                candidateTestPlanVersions,
                { dateKey: 'candidatePhaseReachedAt', isEarliest: true }
            );
            return (
                <>
                    Candidate Review Started{' '}
                    {convertDateToString(earliestVersionDate, 'MMM D, YYYY')}
                </>
            );
        }

        if (draftTestPlanVersions.length) {
            const { earliestVersionDate } = getVersionData(
                draftTestPlanVersions,
                { dateKey: 'draftPhaseReachedAt', isEarliest: true }
            );
            return (
                <>
                    Draft Review Started{' '}
                    {convertDateToString(earliestVersionDate, 'MMM D, YYYY')}
                </>
            );
        }

        if (rdTestPlanVersions.length) {
            const { latestVersionDate } = getVersionData(rdTestPlanVersions);
            return (
                <>
                    R&D Complete on{' '}
                    {convertDateToString(latestVersionDate, 'MMM D, YYYY')}
                </>
            );
        }
        return view;
    };

    const renderCellForPhase = (phase, testPlanVersions = []) => {
        const defaultView = <>N/A</>;

        const insertActivePhaseForTestPlan = testPlanVersion => {
            if (!activePhases[phase]) {
                const result = {
                    ...activePhases,
                    [phase]: testPlanVersion
                };
                setActivePhases(result);
            }
        };

        switch (phase) {
            case 'RD': {
                // If the latest version of the plan is in the draft, candidate, or recommended
                // phase, show string "N/A". This should also apply if there is no R&D phase
                // TestPlanVersions
                if (!testPlanVersions.length) return defaultView;

                const { latestVersion, latestVersionDate } =
                    getVersionData(testPlanVersions);

                const otherTestPlanVersions = [
                    ...draftTestPlanVersions,
                    ...candidateTestPlanVersions,
                    ...recommendedTestPlanVersions
                ];

                if (otherTestPlanVersions.length) {
                    const { latestVersionDate: otherLatestVersionDate } =
                        getVersionData(otherTestPlanVersions);
                    if (otherLatestVersionDate > latestVersionDate) {
                        return defaultView;
                    }
                }

                // If there is an earlier version that is draft and that version has some test plan
                // runs in the test queue, this button will run the process for updating existing
                // reports and preserving data for tests that have not changed.
                let testPlanVersionToAdvanceWithData;
                if (draftTestPlanVersions.length) {
                    const {
                        latestVersion: draftLatestVersion,
                        latestVersionDate: draftLatestVersionDate
                    } = getVersionData(draftTestPlanVersions);

                    if (draftLatestVersionDate < latestVersionDate)
                        testPlanVersionToAdvanceWithData = draftLatestVersion;
                }

                // Otherwise, show VERSION_STRING link with a draft transition button. Phase is
                // "active"
                insertActivePhaseForTestPlan(latestVersion);
                return (
                    <>
                        <a
                            href={`/aria-at/${latestVersion.gitSha}/build/review/${latestVersion.testPlan.directory}.html`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            V
                            {convertDateToString(latestVersionDate, 'YY.MM.DD')}
                        </a>
                        <br />
                        {/* TODO: Use testPlanVersionToAdvanceWithData to determine how this button will work */}
                        <button
                            onClick={async () => {
                                console.info(
                                    'IMPLEMENT advance to',
                                    testPlanVersionToAdvanceWithData
                                        ? testPlanVersionToAdvanceWithData
                                        : 'use current test run data'
                                );

                                await handleClickUpdateTestPlanVersionPhase(
                                    latestVersion.id,
                                    'DRAFT',
                                    testPlanVersionToAdvanceWithData
                                );
                            }}
                        >
                            Advance to Draft
                        </button>
                    </>
                );
            }
            case 'DRAFT': {
                const otherTestPlanVersions = [
                    ...candidateTestPlanVersions,
                    ...recommendedTestPlanVersions
                ];

                // If a version of the plan is not in the draft phase and there are no versions in
                // later phases, show string "Not Started"
                if (![...testPlanVersions, ...otherTestPlanVersions].length)
                    return <>Not Started</>;

                // Link with text "VERSION_STRING" that targets the single-page view of the plan.
                // If required reports are complete and user is an admin, show "Advance to
                // Candidate" button.
                if (testPlanVersions.length) {
                    const { latestVersion, latestVersionDate } =
                        getVersionData(testPlanVersions);

                    const otherPreviousActiveVersions = Object.keys(
                        activePhases
                    ).filter(
                        e => !['RECOMMENDED', 'CANDIDATE', phase].includes(e)
                    );

                    // If there is an earlier version that is candidate and that version has some
                    // test plan runs in the test queue, this button will run the process for
                    // updating existing reports and preserving data for tests that have not
                    // changed.
                    let testPlanVersionToAdvanceWithData;
                    if (candidateTestPlanVersions.length) {
                        const {
                            latestVersion: candidateLatestVersion,
                            latestVersionDate: candidateLatestVersionDate
                        } = getVersionData(candidateTestPlanVersions);

                        if (candidateLatestVersionDate < latestVersionDate)
                            testPlanVersionToAdvanceWithData =
                                candidateLatestVersion;
                    }

                    // Phase is "active"
                    insertActivePhaseForTestPlan(latestVersion);
                    return (
                        <>
                            <a
                                href={`/aria-at/${latestVersion.gitSha}/build/review/${latestVersion.testPlan.directory}.html`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                V
                                {convertDateToString(
                                    latestVersionDate,
                                    'YY.MM.DD'
                                )}
                            </a>
                            <br />
                            <button>Required Reports In Progress</button>
                            {/* TODO: Use testPlanVersionToAdvanceWithData to determine how this button will work */}
                            <button
                                onClick={async () => {
                                    console.info(
                                        'IMPLEMENT advance to',
                                        testPlanVersionToAdvanceWithData
                                            ? testPlanVersionToAdvanceWithData
                                            : 'use current test run data'
                                    );

                                    await handleClickUpdateTestPlanVersionPhase(
                                        latestVersion.id,
                                        'CANDIDATE',
                                        testPlanVersionToAdvanceWithData
                                    );
                                }}
                            >
                                Advance to Candidate
                            </button>
                            {otherPreviousActiveVersions.length ? (
                                <>
                                    <br />+{otherPreviousActiveVersions.length}{' '}
                                    New Version
                                    {otherPreviousActiveVersions.length === 1
                                        ? ''
                                        : 's'}{' '}
                                    in Progress
                                </>
                            ) : null}
                        </>
                    );
                }

                // If a version of the plan is not in the draft phase and there is a version in at
                // least one of candidate or recommended phases, show string "Review of
                // VERSION_STRING completed DATE"
                if (otherTestPlanVersions.length) {
                    const {
                        latestVersion: otherLatestVersion,
                        latestVersionDate: otherLatestVersionDate
                    } = getVersionData(otherTestPlanVersions);

                    const completionDate =
                        otherLatestVersion.phase === 'CANDIDATE'
                            ? otherLatestVersion.candidatePhaseReachedAt
                            : otherLatestVersion.recommendedPhaseReachedAt;

                    return (
                        <>
                            Review of V
                            {convertDateToString(
                                otherLatestVersionDate,
                                'YY.MM.DD'
                            )}{' '}
                            completed{' '}
                            {convertDateToString(completionDate, 'MMM D, YYYY')}
                        </>
                    );
                }
                return defaultView;
            }
            case 'CANDIDATE': {
                const otherTestPlanVersions = [...recommendedTestPlanVersions];

                // If a version of the plan is not in the candidate phase and there has not yet been
                // a recommended version, show string "Not Started"
                if (![...testPlanVersions, ...otherTestPlanVersions].length)
                    return <>Not Started</>;

                // Link with text "VERSION_STRING" that targets the single-page view of the plan.
                //
                // Show string "N Open Review Issues" and if N>=2, append " from N AT" Examples: "3
                // Open Review Issues from 2 AT" or "0 Open Review Issues"
                //
                // Show button "Advance to Recommended" when the following conditions are met:
                //  - If there has not yet been a recommended version and open issues = 0 and days
                //    in review > 120 and user is admin, show the button.
                //  - If there is already a recommended version and open review issues = 0 and user
                //    is admin, show the button.
                //  - If there is an earlier version that is recommended and that version has some
                //    test plan runs in the test queue, this button will run the process for
                //    updating existing reports and preserving data for tests that have not changed.
                //  - if there is an earlier version in the recommended phase, this button will
                //    sunset that version. This will also sunset any reports completed using that
                //    version.
                if (testPlanVersions.length) {
                    const { latestVersion, latestVersionDate } =
                        getVersionData(testPlanVersions);

                    const filteredTestPlanReports = testPlanReports.filter(
                        testPlanReport =>
                            testPlanReport.testPlanVersion.id ===
                            latestVersion.id
                    );

                    const uniqueAtObjects = getUniqueAtObjects(
                        filteredTestPlanReports
                    );
                    const uniqueAtsCount = Object.keys(uniqueAtObjects).length;

                    const issuesCount = filteredTestPlanReports.reduce(
                        (acc, obj) => acc + obj.issues.length,
                        0
                    );

                    const otherPreviousActiveVersions = Object.keys(
                        activePhases
                    ).filter(e => !['RECOMMENDED', phase].includes(e));

                    // If there is an earlier version that is recommended and that version has some
                    // test plan runs in the test queue, this button will run the process for
                    // updating existing reports and preserving data for tests that have not
                    // changed.
                    let testPlanVersionToAdvanceWithData;
                    if (recommendedTestPlanVersions.length) {
                        const {
                            latestVersion: recommendedLatestVersion,
                            latestVersionDate: recommendedLatestVersionDate
                        } = getVersionData(recommendedTestPlanVersions);

                        if (recommendedLatestVersionDate < latestVersionDate)
                            testPlanVersionToAdvanceWithData =
                                recommendedLatestVersion;
                    }

                    // Phase is "active"
                    insertActivePhaseForTestPlan(latestVersion);
                    return (
                        <>
                            <a
                                href={`/aria-at/${latestVersion.gitSha}/build/review/${latestVersion.testPlan.directory}.html`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                V
                                {convertDateToString(
                                    latestVersionDate,
                                    'YY.MM.DD'
                                )}
                            </a>
                            <br />
                            {issuesCount} Open Issue
                            {`${issuesCount === 1 ? '' : 's'}`}
                            {`${
                                issuesCount >= 2
                                    ? ` from ${uniqueAtsCount} ATs`
                                    : ''
                            }`}
                            <br />
                            {/* TODO: Use testPlanVersionToAdvanceWithData to determine how this button will work */}
                            <button
                                onClick={async () => {
                                    console.info(
                                        'IMPLEMENT advance to',
                                        testPlanVersionToAdvanceWithData
                                            ? testPlanVersionToAdvanceWithData
                                            : 'use current test run data'
                                    );

                                    await handleClickUpdateTestPlanVersionPhase(
                                        latestVersion.id,
                                        'RECOMMENDED',
                                        testPlanVersionToAdvanceWithData
                                    );
                                }}
                            >
                                Advance to Recommended
                            </button>
                            {otherPreviousActiveVersions.length ? (
                                <>
                                    <br />+{otherPreviousActiveVersions.length}{' '}
                                    New Version
                                    {otherPreviousActiveVersions.length === 1
                                        ? ''
                                        : 's'}{' '}
                                    in Progress
                                </>
                            ) : null}
                        </>
                    );
                }

                // If a version of the plan is not in the candidate phase and there is a recommended
                // version, show string "Review of VERSION_STRING completed DATE"
                if (otherTestPlanVersions.length) {
                    const {
                        latestVersion: otherLatestVersion,
                        latestVersionDate: otherLatestVersionDate
                    } = getVersionData(otherTestPlanVersions);

                    const completionDate =
                        otherLatestVersion.recommendedPhaseReachedAt;

                    return (
                        <>
                            Review of V
                            {convertDateToString(
                                otherLatestVersionDate,
                                'YY.MM.DD'
                            )}{' '}
                            completed{' '}
                            {convertDateToString(completionDate, 'MMM D, YYYY')}
                        </>
                    );
                }
                return defaultView;
            }
            case 'RECOMMENDED': {
                // If a version of the plan is not in the recommended phase, shows the string "None
                // Yet"
                if (!testPlanVersions.length) return <>None Yet</>;

                // Link with text "VERSION_STRING" that targets the single-page view of the plan
                const { latestVersion, latestVersionDate } =
                    getVersionData(testPlanVersions);

                const completionDate = latestVersion.recommendedPhaseReachedAt;

                const otherPreviousActiveVersions = Object.keys(
                    activePhases
                ).filter(e => ![phase].includes(e));

                // Phase is "active"
                insertActivePhaseForTestPlan(latestVersion);
                return (
                    <>
                        <a
                            href={`/aria-at/${latestVersion.gitSha}/build/review/${latestVersion.testPlan.directory}.html`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            V
                            {convertDateToString(latestVersionDate, 'YY.MM.DD')}
                        </a>
                        <br />
                        Approved{' '}
                        {convertDateToString(completionDate, 'MMM D, YYYY')}
                        {otherPreviousActiveVersions.length ? (
                            <>
                                <br />+{otherPreviousActiveVersions.length} New
                                Version
                                {otherPreviousActiveVersions.length === 1
                                    ? ''
                                    : 's'}{' '}
                                in Progress
                            </>
                        ) : null}
                    </>
                );
            }
        }
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <tr>
                <th>{testPlan.title}</th>
                <td>{renderCellForCoveredAts()}</td>
                <td>{renderCellForOverallStatus()}</td>
                <td>{renderCellForPhase('RD', rdTestPlanVersions)}</td>
                <td>{renderCellForPhase('DRAFT', draftTestPlanVersions)}</td>
                <td>
                    {renderCellForPhase('CANDIDATE', candidateTestPlanVersions)}
                </td>
                <td>
                    {renderCellForPhase(
                        'RECOMMENDED',
                        recommendedTestPlanVersions
                    )}
                </td>
            </tr>

            {showThemedModal && (
                <BasicThemedModal
                    show={showThemedModal}
                    theme={themedModalType}
                    title={themedModalTitle}
                    dialogClassName="modal-50w"
                    content={themedModalContent}
                    actionButtons={[
                        {
                            text: 'Ok',
                            action: onThemedModalClose
                        }
                    ]}
                    handleClose={onThemedModalClose}
                    showCloseAction={false}
                />
            )}
        </LoadingStatus>
    );
};

DataManagementRow.propTypes = {};

export default DataManagementRow;
