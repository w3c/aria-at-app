import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
import {
    UPDATE_TEST_PLAN_VERSION_PHASE,
    UPDATE_TEST_PLAN_VERSION_RECOMMENDED_TARGET_DATE
} from '../queries';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';
import {
    checkTimeBetweenDates,
    convertDateToString,
    convertStringFormatToAnotherFormat
} from '../../../utils/formatter';
import { derivePhaseName } from '@client/utils/aria';
import { THEMES, useThemedModal } from '@client/hooks/useThemedModal';
import BasicModal from '@components/common/BasicModal';
import TestPlanReportStatusDialogWithButton from '../../TestPlanReportStatusDialog/WithButton';
import ReportStatusDot from '../../common/ReportStatusDot';
import UpdateTargetDateModal from '@components/common/UpdateTargetDateModal';
import VersionString from '../../common/VersionString';
import PhasePill from '../../common/PhasePill';
import { uniq as unique, uniqBy as uniqueBy } from 'lodash';

const StatusCell = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    .review-text {
        margin-top: 1rem;
        font-size: 14px;
        text-align: center;

        margin-bottom: 88px;
    }

    .versions-in-progress {
        display: flex;
        justify-content: center;
        padding: 12px;
        font-size: 14px;

        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        color: #6a7989;
        background: #f6f8fa;

        > span.pill {
            display: flex;
            width: fit-content;
            height: 20px;

            justify-content: center;
            align-items: center;
            align-self: center;

            margin-right: 6px;
            min-width: 40px;
            border-radius: 14px;

            background: #6a7989;
            color: white;
        }
    }
`;

const PhaseCell = styled.div`
    padding: 0 !important; /* override padding for td and add margins into specific children */

    display: flex;
    flex-direction: column;
    height: 100%;

    > span.review-complete {
        display: block;
        font-size: 14px;
        text-align: center;
        margin: 12px 0.75rem;
        color: #333f4d;
    }

    > span.more {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        padding: 0.5rem;
        font-size: 14px;

        margin-top: 6px;

        color: #6a7989;
        background: #f6f8fa;

        > span.more-issues-container {
            width: 100%;
            text-align: center;

            .issues {
                margin-right: 4px;
            }

            align-items: center;
        }

        > span.target-days-container {
            text-align: center;

            button {
                appearance: none;
                border: none;
                background: none;
                color: inherit;

                margin: 0;
                padding: 0;
            }
        }
    }

    > .advance-button {
        margin: 12px 0.75rem;
        width: calc(100% - 1.5rem);
    }
`;

const NoneText = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    font-style: italic;
    color: #6a7989;
`;

const DataManagementRow = ({
    isAdmin,
    ats,
    testPlan,
    testPlanVersions,
    setTestPlanVersions
}) => {
    const { triggerLoad, loadingMessage } = useTriggerLoad();
    const {
        themedModal,
        showThemedModal,
        setShowThemedModal,
        setThemedModalTitle,
        setThemedModalContent,
        setFocusRef
    } = useThemedModal({
        type: THEMES.WARNING,
        title: 'Error Updating Test Plan Status'
    });
    const [updateTestPlanVersionPhaseMutation] = useMutation(
        UPDATE_TEST_PLAN_VERSION_PHASE
    );
    const [updateTestPlanVersionRecommendedTargetDate] = useMutation(
        UPDATE_TEST_PLAN_VERSION_RECOMMENDED_TARGET_DATE
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

    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceModalData, setAdvanceModalData] = useState({});

    const [showUpdateTargetModal, setShowUpdateTargetModal] = useState(false);
    const [updateTargetModalData, setUpdateTargetModalData] = useState({});

    const draftVersionStringRef = useRef();
    const candidateVersionStringRef = useRef();
    const recommendedVersionStringRef = useRef();
    const updateTargetRef = useRef();

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
    const getVersionData = (testPlanVersions, dateKey = 'updatedAt') => {
        const earliestVersion = testPlanVersions.reduce((a, b) =>
            new Date(a[dateKey]) < new Date(b[dateKey]) ? a : b
        );
        const earliestVersionDate = new Date(earliestVersion[dateKey]);

        const latestVersion = testPlanVersions.reduce((a, b) =>
            new Date(a[dateKey]) > new Date(b[dateKey]) ? a : b
        );
        const latestVersionDate = new Date(latestVersion[dateKey]);

        return {
            earliestVersion,
            earliestVersionDate,
            latestVersion,
            latestVersionDate
        };
    };

    const handleClickUpdateTestPlanVersionPhase = async (
        testPlanVersionId,
        phase,
        testPlanVersionDataToInclude
    ) => {
        try {
            await triggerLoad(async () => {
                const result = await updateTestPlanVersionPhaseMutation({
                    variables: {
                        testPlanVersionId,
                        phase,
                        testPlanVersionDataToIncludeId:
                            testPlanVersionDataToInclude?.id
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

                setTimeout(() => {
                    if (phase === 'DRAFT' && draftVersionStringRef.current)
                        draftVersionStringRef.current.focus();

                    if (
                        phase === 'CANDIDATE' &&
                        candidateVersionStringRef.current
                    )
                        candidateVersionStringRef.current.focus();

                    if (
                        phase === 'RECOMMENDED' &&
                        recommendedVersionStringRef.current
                    )
                        recommendedVersionStringRef.current.focus();
                }, 250);
            }, 'Updating Test Plan Version Phase');
        } catch (e) {
            console.error(e.message);
            setShowThemedModal(true);
            setThemedModalTitle('Error Updating Test Plan Version Phase');
            setThemedModalContent(<>{e.message}</>);
        }
    };

    const handleClickUpdateTestPlanVersionRecommendedPhaseTargetDate = async ({
        updatedDateText
    }) => {
        setShowUpdateTargetModal(false);
        try {
            await triggerLoad(async () => {
                const result = await updateTestPlanVersionRecommendedTargetDate(
                    {
                        variables: {
                            testPlanVersionId:
                                updateTargetModalData.testPlanVersionId,
                            recommendedPhaseTargetDate:
                                convertStringFormatToAnotherFormat(
                                    updatedDateText
                                )
                        }
                    }
                );
                const updatedTestPlanVersion =
                    result.data.testPlanVersion.updateRecommendedPhaseTargetDate
                        .testPlanVersion;
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

                setTimeout(() => {
                    if (updateTargetRef.current)
                        updateTargetRef.current.focus();
                }, 250);
            }, 'Updating Test Plan Version Recommended Phase Target Date');
        } catch (e) {
            console.error(e.message);
            setShowThemedModal(true);
            setThemedModalTitle(
                'Error Updating Test Plan Version Recommended Phase Target Date'
            );
            setThemedModalContent(<>{e.message}</>);
        }
    };

    const renderCellForCoveredAts = () => {
        const atNames = ats.map(({ name }) => name);

        if (atNames.length > 1) {
            return (
                <div>
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
                </div>
            );
        } else if (atNames.length === 1) return <b>{atNames[0]}</b>;
        else return <NoneText>N/A</NoneText>;
    };

    const renderCellForOverallStatus = () => {
        const phaseView = (phase, versionDate) => {
            let phaseText = '';

            switch (phase) {
                case 'RD':
                    phaseText = 'Complete ';
                    break;
                case 'DRAFT':
                case 'CANDIDATE':
                    phaseText = 'Review Started ';
                    break;
                case 'RECOMMENDED':
                    phaseText = 'Since ';
                    break;
            }

            const dateString = convertDateToString(versionDate, 'MMM D, YYYY');

            return (
                <>
                    <PhasePill>{phase}</PhasePill>
                    <p className="review-text">
                        {phaseText}
                        <b>{dateString}</b>
                    </p>
                </>
            );
        };

        const versionsInProgressView = versionsCount => {
            return versionsCount ? (
                <span className="versions-in-progress">
                    <>
                        <span className="pill">+{versionsCount}</span> New
                        Version
                        {versionsCount === 1 ? '' : 's'} in Progress
                    </>
                </span>
            ) : null;
        };

        const otherVersionsInProgressCount = (
            currentPhase, // To exclude in check
            excludedPhases = []
        ) => {
            const otherVersionsInProgress = Object.keys(activePhases).filter(
                e => ![currentPhase, ...excludedPhases].includes(e)
            );
            return otherVersionsInProgress.length;
        };

        if (recommendedTestPlanVersions.length) {
            const { earliestVersion, earliestVersionDate } = getVersionData(
                recommendedTestPlanVersions,
                'recommendedPhaseReachedAt'
            );
            const { phase } = earliestVersion;
            const versionsInProgressCount = otherVersionsInProgressCount(phase);

            return (
                <StatusCell>
                    {phaseView(phase, earliestVersionDate)}
                    {versionsInProgressView(versionsInProgressCount)}
                </StatusCell>
            );
        }

        if (candidateTestPlanVersions.length) {
            const { earliestVersion, earliestVersionDate } = getVersionData(
                candidateTestPlanVersions,
                'candidatePhaseReachedAt'
            );
            const { phase } = earliestVersion;

            const versionsInProgressCount = otherVersionsInProgressCount(
                phase,
                ['RECOMMENDED']
            );

            return (
                <StatusCell>
                    {phaseView(phase, earliestVersionDate)}
                    {versionsInProgressView(versionsInProgressCount)}
                </StatusCell>
            );
        }

        if (draftTestPlanVersions.length) {
            const { earliestVersion, earliestVersionDate } = getVersionData(
                draftTestPlanVersions,
                'draftPhaseReachedAt'
            );
            const { phase } = earliestVersion;

            const versionsInProgressCount = otherVersionsInProgressCount(
                phase,
                ['RECOMMENDED', 'CANDIDATE']
            );

            return (
                <StatusCell>
                    {phaseView(phase, earliestVersionDate)}
                    {versionsInProgressView(versionsInProgressCount)}
                </StatusCell>
            );
        }

        if (rdTestPlanVersions.length) {
            const { latestVersion, latestVersionDate } =
                getVersionData(rdTestPlanVersions);
            const { phase } = latestVersion;
            return (
                <StatusCell>{phaseView(phase, latestVersionDate)}</StatusCell>
            );
        }

        // Should never be called but just in case
        return null;
    };

    const renderCellForPhase = (phase, testPlanVersions = []) => {
        const defaultView = <NoneText>N/A</NoneText>;

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
                let testPlanVersionDataToInclude;
                if (draftTestPlanVersions.length) {
                    const {
                        latestVersion: draftLatestVersion,
                        latestVersionDate: draftLatestVersionDate
                    } = getVersionData(draftTestPlanVersions);

                    if (draftLatestVersionDate < latestVersionDate)
                        testPlanVersionDataToInclude = draftLatestVersion;
                }

                // Otherwise, show VERSION_STRING link with a draft transition button. Phase is
                // "active"
                insertActivePhaseForTestPlan(latestVersion);
                return (
                    <PhaseCell role="list">
                        <VersionString
                            role="listitem"
                            date={latestVersionDate}
                            iconColor="#2BA51C"
                            linkHref={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                        />
                        {isAdmin && (
                            <Button
                                role="listitem"
                                ref={ref => setFocusRef(ref)}
                                className="advance-button"
                                variant="secondary"
                                onClick={async () => {
                                    setShowAdvanceModal(true);
                                    setAdvanceModalData({
                                        phase: derivePhaseName('DRAFT'),
                                        version: convertDateToString(
                                            latestVersionDate,
                                            'YY.MM.DD'
                                        ),
                                        advanceFunc: () => {
                                            setShowAdvanceModal(false);
                                            handleClickUpdateTestPlanVersionPhase(
                                                latestVersion.id,
                                                'DRAFT',
                                                testPlanVersionDataToInclude
                                            );
                                        },
                                        coveredReports: []
                                    });
                                }}
                            >
                                Advance to Draft
                            </Button>
                        )}
                    </PhaseCell>
                );
            }
            case 'DRAFT': {
                let latestVersion, latestVersionDate;

                let otherTestPlanVersions = [
                    ...candidateTestPlanVersions,
                    ...recommendedTestPlanVersions
                ];

                if (testPlanVersions.length) {
                    const {
                        latestVersion: _latestVersion,
                        latestVersionDate: _latestVersionDate
                    } = getVersionData(testPlanVersions);

                    latestVersion = _latestVersion;
                    latestVersionDate = _latestVersionDate;

                    if (otherTestPlanVersions.length)
                        otherTestPlanVersions = otherTestPlanVersions.filter(
                            other =>
                                new Date(other.updatedAt) > latestVersionDate
                        );
                }

                // If a version of the plan is not in the draft phase and there are no versions in
                // later phases, show string "Not Started"
                if (![...testPlanVersions, ...otherTestPlanVersions].length)
                    return <NoneText>Not Started</NoneText>;

                // If a version of the plan is not in the draft phase and there is a version in at
                // least one of candidate or recommended phases, show string "Review of
                // VERSION_STRING completed DATE"
                if (otherTestPlanVersions.length) {
                    const {
                        latestVersion: otherLatestVersion,
                        latestVersionDate: otherLatestVersionDate
                    } = getVersionData(otherTestPlanVersions);

                    const completionDate =
                        otherLatestVersion.candidatePhaseReachedAt;

                    return (
                        <PhaseCell role="list">
                            <VersionString
                                role="listitem"
                                date={otherLatestVersionDate}
                                iconColor="#818F98"
                            />
                            <span role="listitem" className="review-complete">
                                Review Completed&nbsp;
                                <b>
                                    {convertDateToString(
                                        completionDate,
                                        'MMM D, YYYY'
                                    )}
                                </b>
                            </span>
                        </PhaseCell>
                    );
                }

                // Link with text "VERSION_STRING" that targets the single-page view of the plan.
                // If required reports are complete and user is an admin, show "Advance to
                // Candidate" button.
                if (testPlanVersions.length) {
                    // If there is an earlier version that is candidate and that version has some
                    // test plan runs in the test queue, this button will run the process for
                    // updating existing reports and preserving data for tests that have not
                    // changed.
                    let testPlanVersionDataToInclude;
                    if (candidateTestPlanVersions.length) {
                        const {
                            latestVersion: candidateLatestVersion,
                            latestVersionDate: candidateLatestVersionDate
                        } = getVersionData(candidateTestPlanVersions);

                        if (candidateLatestVersionDate < latestVersionDate)
                            testPlanVersionDataToInclude =
                                candidateLatestVersion;
                    }

                    let coveredReports = [];
                    let finalReportFound = false;

                    latestVersion.testPlanReports.forEach(testPlanReport => {
                        const markedFinalAt = testPlanReport.markedFinalAt;
                        const atName = testPlanReport.at.name;
                        const browserName = testPlanReport.browser.name;
                        const value = `${atName}_${browserName}`;

                        if (markedFinalAt && !coveredReports.includes(value)) {
                            finalReportFound = true;
                            coveredReports.push(value);
                        }
                    });

                    // Phase is "active"
                    insertActivePhaseForTestPlan(latestVersion);
                    return (
                        <PhaseCell role="list">
                            <VersionString
                                role="listitem"
                                date={latestVersionDate}
                                iconColor="#2BA51C"
                                linkRef={draftVersionStringRef}
                                linkHref={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                            />
                            {isAdmin && (
                                <Button
                                    role="listitem"
                                    ref={ref => setFocusRef(ref)}
                                    className="advance-button"
                                    variant="secondary"
                                    onClick={async () => {
                                        if (finalReportFound) {
                                            setShowAdvanceModal(true);
                                            setAdvanceModalData({
                                                phase: derivePhaseName(
                                                    'CANDIDATE'
                                                ),
                                                version: convertDateToString(
                                                    latestVersionDate,
                                                    'YY.MM.DD'
                                                ),
                                                advanceFunc: () => {
                                                    setShowAdvanceModal(false);
                                                    handleClickUpdateTestPlanVersionPhase(
                                                        latestVersion.id,
                                                        'CANDIDATE',
                                                        testPlanVersionDataToInclude
                                                    );
                                                },
                                                coveredReports
                                            });
                                        } else {
                                            setShowThemedModal(true);
                                            setThemedModalTitle(
                                                'Error Updating Test Plan Version Phase'
                                            );
                                            setThemedModalContent(
                                                <>
                                                    No reports have been marked
                                                    as final.
                                                </>
                                            );
                                        }
                                    }}
                                >
                                    Advance to Candidate
                                </Button>
                            )}
                            <TestPlanReportStatusDialogWithButton
                                role="listitem"
                                testPlanVersionId={latestVersion.id}
                            />
                        </PhaseCell>
                    );
                }
                return defaultView;
            }
            case 'CANDIDATE': {
                let latestVersion, latestVersionDate;

                let otherTestPlanVersions = [...recommendedTestPlanVersions];

                if (testPlanVersions.length) {
                    const {
                        latestVersion: _latestVersion,
                        latestVersionDate: _latestVersionDate
                    } = getVersionData(testPlanVersions);

                    latestVersion = _latestVersion;
                    latestVersionDate = _latestVersionDate;

                    if (otherTestPlanVersions.length)
                        otherTestPlanVersions = otherTestPlanVersions.filter(
                            other =>
                                new Date(other.updatedAt) > latestVersionDate
                        );
                }

                // If a version of the plan is not in the candidate phase and there has not yet been
                // a recommended version, show string "Not Started"
                if (![...testPlanVersions, ...otherTestPlanVersions].length)
                    return <NoneText>Not Started</NoneText>;

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
                        <PhaseCell role="list">
                            <VersionString
                                role="listitem"
                                date={otherLatestVersionDate}
                                iconColor="#818F98"
                            />
                            <span role="listitem" className="review-complete">
                                Review Completed&nbsp;
                                <b>
                                    {convertDateToString(
                                        completionDate,
                                        'MMM D, YYYY'
                                    )}
                                </b>
                            </span>
                        </PhaseCell>
                    );
                }

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
                    const uniqueAtsCount = unique(
                        testPlanVersions
                            .flatMap(
                                testPlanVersion =>
                                    testPlanVersion.testPlanReports
                            )
                            .filter(
                                testPlanReport => testPlanReport.issues.length
                            )
                            .map(testPlanReport => testPlanReport.at.id)
                    ).length;

                    const issuesCount = uniqueBy(
                        testPlanVersions.flatMap(testPlanVersion =>
                            testPlanVersion.testPlanReports.flatMap(
                                testPlanReport =>
                                    testPlanReport.issues.filter(
                                        issue => issue.isOpen
                                    )
                            )
                        ),
                        item => item.link
                    ).length;

                    // If there is an earlier version that is recommended and that version has some
                    // test plan runs in the test queue, this button will run the process for
                    // updating existing reports and preserving data for tests that have not
                    // changed.
                    let testPlanVersionDataToInclude;
                    if (recommendedTestPlanVersions.length) {
                        const {
                            latestVersion: recommendedLatestVersion,
                            latestVersionDate: recommendedLatestVersionDate
                        } = getVersionData(recommendedTestPlanVersions);

                        if (recommendedLatestVersionDate < latestVersionDate)
                            testPlanVersionDataToInclude =
                                recommendedLatestVersion;
                    }

                    const currentDate = new Date();
                    const recommendedPhaseTargetDate = new Date(
                        latestVersion.recommendedPhaseTargetDate
                    );

                    let timeToTargetDate = 0;
                    if (currentDate > recommendedPhaseTargetDate) {
                        // Indicates that this is in the past
                        timeToTargetDate = checkTimeBetweenDates(
                            currentDate,
                            recommendedPhaseTargetDate
                        );
                        timeToTargetDate = -timeToTargetDate;
                    } else
                        timeToTargetDate = checkTimeBetweenDates(
                            recommendedPhaseTargetDate,
                            currentDate
                        );

                    const daysBetweenDates = checkTimeBetweenDates(
                        currentDate,
                        latestVersion.candidatePhaseReachedAt
                    );
                    const DAYS_TO_PROVIDE_FEEDBACK = 120;
                    const shouldShowAdvanceButton =
                        isAdmin &&
                        issuesCount === 0 &&
                        (recommendedTestPlanVersions.length ||
                            (!recommendedTestPlanVersions.length &&
                                daysBetweenDates > DAYS_TO_PROVIDE_FEEDBACK));

                    let coveredReports = [];
                    latestVersion.testPlanReports.forEach(testPlanReport => {
                        const markedFinalAt = testPlanReport.markedFinalAt;
                        const atName = testPlanReport.at.name;
                        const browserName = testPlanReport.browser.name;
                        const value = `${atName}_${browserName}`;

                        if (markedFinalAt && !coveredReports.includes(value))
                            coveredReports.push(value);
                    });

                    // Phase is "active"
                    insertActivePhaseForTestPlan(latestVersion);
                    return (
                        <PhaseCell
                            role="list"
                            aria-level="1"
                            aria-setsize={shouldShowAdvanceButton ? 4 : 3}
                        >
                            <VersionString
                                role="listitem"
                                date={latestVersionDate}
                                iconColor="#2BA51C"
                                linkRef={candidateVersionStringRef}
                                linkHref={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                            />
                            {shouldShowAdvanceButton && (
                                <Button
                                    role="listitem"
                                    ref={ref => setFocusRef(ref)}
                                    className="advance-button"
                                    variant="secondary"
                                    onClick={async () => {
                                        setShowAdvanceModal(true);
                                        setAdvanceModalData({
                                            phase: derivePhaseName(
                                                'RECOMMENDED'
                                            ),
                                            version: convertDateToString(
                                                latestVersionDate,
                                                'YY.MM.DD'
                                            ),
                                            advanceFunc: () => {
                                                setShowAdvanceModal(false);
                                                handleClickUpdateTestPlanVersionPhase(
                                                    latestVersion.id,
                                                    'RECOMMENDED',
                                                    testPlanVersionDataToInclude
                                                );
                                            },
                                            coveredReports
                                        });
                                    }}
                                >
                                    Advance to Recommended
                                </Button>
                            )}
                            <TestPlanReportStatusDialogWithButton
                                role="listitem"
                                testPlanVersionId={latestVersion.id}
                            />
                            <span role="list" className="more" aria-level="2">
                                <span
                                    role="listitem"
                                    className="more-issues-container"
                                >
                                    <ReportStatusDot className="issues" />
                                    &nbsp;
                                    {issuesCount} Open Issue
                                    {`${issuesCount === 1 ? '' : 's'}`}
                                    {`${
                                        issuesCount >= 2
                                            ? ` from ${uniqueAtsCount} ATs`
                                            : ''
                                    }`}
                                </span>
                                <span
                                    role="listitem"
                                    className="target-days-container"
                                >
                                    {isAdmin ? (
                                        <button
                                            ref={updateTargetRef}
                                            onClick={() => {
                                                setShowUpdateTargetModal(true);
                                                setUpdateTargetModalData({
                                                    testPlanVersionId:
                                                        latestVersion.id,
                                                    title: `Change Recommended Phase Target Date for ${
                                                        testPlan.title
                                                    }, ${
                                                        'V' +
                                                        convertDateToString(
                                                            latestVersionDate,
                                                            'YY.MM.DD'
                                                        )
                                                    }`,
                                                    dateText:
                                                        latestVersion.recommendedPhaseTargetDate
                                                });
                                            }}
                                        >
                                            Target&nbsp;
                                            <b>
                                                {Math.abs(timeToTargetDate)}{' '}
                                                Days
                                            </b>
                                            &nbsp;
                                            {timeToTargetDate < 0
                                                ? 'Past'
                                                : 'Away'}
                                        </button>
                                    ) : (
                                        <>
                                            Target&nbsp;
                                            <b>
                                                {Math.abs(timeToTargetDate)}{' '}
                                                Days
                                            </b>
                                            &nbsp;
                                            {timeToTargetDate < 0
                                                ? 'Past'
                                                : 'Away'}
                                        </>
                                    )}
                                </span>
                            </span>
                        </PhaseCell>
                    );
                }
                return defaultView;
            }
            case 'RECOMMENDED': {
                // If a version of the plan is not in the recommended phase, shows the string "None
                // Yet"
                if (!testPlanVersions.length)
                    return <NoneText>None Yet</NoneText>;

                // Link with text "VERSION_STRING" that targets the single-page view of the plan
                const { latestVersion, latestVersionDate } =
                    getVersionData(testPlanVersions);

                const completionDate = latestVersion.recommendedPhaseReachedAt;

                // Phase is "active"
                insertActivePhaseForTestPlan(latestVersion);
                return (
                    <PhaseCell role="list">
                        <VersionString
                            role="listitem"
                            date={latestVersionDate}
                            iconColor="#2BA51C"
                            linkRef={recommendedVersionStringRef}
                            linkHref={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                        />
                        <span role="listitem" className="review-complete">
                            Approved&nbsp;
                            <b>
                                {convertDateToString(
                                    completionDate,
                                    'MMM D, YYYY'
                                )}
                            </b>
                        </span>
                    </PhaseCell>
                );
            }
        }
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <tr>
                <th>
                    <a href={`/data-management/${testPlan.directory}`}>
                        <b>{testPlan.title}</b>
                    </a>
                </th>
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

            {showThemedModal && themedModal}
            {showAdvanceModal && (
                <BasicModal
                    show={showAdvanceModal}
                    closeButton={false}
                    title={`Advancing test plan, ${testPlan.title}, V${advanceModalData.version}`}
                    content={
                        <>
                            This version will be updated to&nbsp;
                            <b>{advanceModalData.phase}</b>.&nbsp;
                            {advanceModalData.coveredReports?.length ? (
                                <>
                                    <br />
                                    <br />
                                    The included reports cover:
                                    <ul>
                                        {advanceModalData.coveredReports.map(
                                            e => {
                                                const [atName, browserName] =
                                                    e.split('_');

                                                return (
                                                    <li
                                                        key={`${testPlan.id}${atName}${browserName}`}
                                                    >
                                                        <b>
                                                            {atName} and&nbsp;
                                                            {browserName}
                                                        </b>
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>
                                    Do you want to continue?
                                </>
                            ) : (
                                <>Do you want to continue?</>
                            )}
                        </>
                    }
                    actionLabel="Continue"
                    closeLabel="Cancel"
                    handleAction={async () => {
                        await advanceModalData.advanceFunc();
                    }}
                    handleClose={() => setShowAdvanceModal(false)}
                    staticBackdrop={true}
                />
            )}
            {showUpdateTargetModal && (
                <UpdateTargetDateModal
                    show={showUpdateTargetModal}
                    title={updateTargetModalData.title}
                    dateText={updateTargetModalData.dateText}
                    handleAction={
                        handleClickUpdateTestPlanVersionRecommendedPhaseTargetDate
                    }
                    handleClose={() => setShowUpdateTargetModal(false)}
                />
            )}
        </LoadingStatus>
    );
};

DataManagementRow.propTypes = {
    isAdmin: PropTypes.bool,
    ats: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string
        })
    ),
    testPlan: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        directory: PropTypes.string
    }).isRequired,
    testPlanVersions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string,
            phase: PropTypes.string,
            gitSha: PropTypes.string,
            testPlan: PropTypes.shape({
                directory: PropTypes.string
            }),
            updatedAt: PropTypes.string,
            draftPhaseReachedAt: PropTypes.string,
            candidatePhaseReachedAt: PropTypes.string,
            recommendedPhaseReachedAt: PropTypes.string
        })
    ).isRequired,
    setTestPlanVersions: PropTypes.func
};

export default DataManagementRow;
