import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
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
import UpdateTargetDateModal from '@components/common/UpdateTargetDateModal';

const StatusCell = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    span:nth-of-type(2) {
        margin-top: 1rem;
        font-size: 14px;
        text-align: center;

        margin-bottom: 88px;
    }

    span:nth-of-type(3) {
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
    > span.version-string {
        display: flex;
        justify-content: center;
        align-items: center;

        //padding: 4px 8px;
        height: 2rem;
        border-radius: 4px;

        width: 100%;
        background: #f6f8fa;
    }

    > span.review-complete {
        display: block;
        font-size: 14px;
        text-align: center;
        margin-top: 12px;

        color: #333f4d;
    }

    > span.more {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        padding: 4px;
        font-size: 14px;

        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;

        color: #6a7989;
        background: #f6f8fa;

        > span.more-issues-container {
            display: flex;
            flex-direction: row;

            align-items: center;
        }

        > span.target-days-container {
            text-align: center;

            button {
                appearance: none;
                border: none;
                background: none;
                color: inherit;
                font-weight: bold;

                margin: 0;
                padding: 0;
            }
        }
    }

    > button {
        margin-top: 12px;
    }
`;

const PhaseText = styled.span`
    display: inline-block;
    width: 100%;
    padding: 2px 4px;
    border-radius: 14px;

    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    color: white;

    &.rd {
        background: #4177de;
    }

    &.draft {
        background: #818f98;
    }

    &.candidate {
        background: #ff6c00;
    }

    &.recommended {
        background: #8441de;
    }
`;

const ReportStatusDot = styled.span`
    display: inline-block;
    height: 10px;
    width: 10px;
    padding: 0;
    margin-right: 8px;
    border-radius: 50%;

    &.issues {
        background: #f2ba00;
    }

    &.reports-not-started {
        background: #7c7c7c;
    }

    &.reports-in-progress {
        background: #3876e8;
    }

    &.reports-complete {
        background: #2ba51c;
    }

    &.reports-missing {
        background: #ce1b4c;
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
        else return <NoneText>N/A</NoneText>;
    };

    const renderCellForOverallStatus = () => {
        const phaseView = (phase, versionDate) => {
            let phaseText = '';

            switch (phase) {
                case 'RD':
                    phaseText = 'Complete';
                    break;
                case 'DRAFT':
                case 'CANDIDATE':
                    phaseText = 'Review Started';
                    break;
                case 'RECOMMENDED':
                    phaseText = 'Since';
                    break;
            }

            return (
                <>
                    <PhaseText className={phase.toLowerCase()}>
                        {derivePhaseName(phase)}
                    </PhaseText>
                    <span>
                        {phaseText}{' '}
                        <b>{convertDateToString(versionDate, 'MMM D, YYYY')}</b>
                    </span>
                </>
            );
        };

        const versionsInProgressView = versionsCount => {
            return versionsCount ? (
                <span>
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
                    <PhaseCell>
                        <span className="version-string">
                            <FontAwesomeIcon
                                icon={faCircleCheck}
                                color="#2BA51C"
                            />
                            <a
                                href={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <b>
                                    V
                                    {convertDateToString(
                                        latestVersionDate,
                                        'YY.MM.DD'
                                    )}
                                </b>
                            </a>
                        </span>
                        {isAdmin && (
                            <Button
                                ref={ref => setFocusRef(ref)}
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
                        <PhaseCell>
                            <span className="version-string">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    color="#818F98"
                                />
                                <b>
                                    V
                                    {convertDateToString(
                                        otherLatestVersionDate,
                                        'YY.MM.DD'
                                    )}
                                </b>
                            </span>
                            <span className="review-complete">
                                Review Completed{' '}
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
                        <PhaseCell>
                            <span className="version-string">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    color="#2BA51C"
                                />
                                <a
                                    ref={draftVersionStringRef}
                                    href={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <b>
                                        V
                                        {convertDateToString(
                                            latestVersionDate,
                                            'YY.MM.DD'
                                        )}
                                    </b>
                                </a>
                            </span>
                            {isAdmin && (
                                <Button
                                    ref={ref => setFocusRef(ref)}
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
                        <PhaseCell>
                            <span className="version-string">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    color="#818F98"
                                />
                                <b>
                                    V
                                    {convertDateToString(
                                        otherLatestVersionDate,
                                        'YY.MM.DD'
                                    )}
                                </b>
                            </span>
                            <span className="review-complete">
                                Review Completed{' '}
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
                    const filteredTestPlanReports =
                        latestVersion.testPlanReports;
                    const uniqueAtObjects = getUniqueAtObjects(
                        filteredTestPlanReports
                    );
                    const uniqueAtsCount = Object.keys(uniqueAtObjects).length;

                    const issuesCount = filteredTestPlanReports.reduce(
                        (acc, obj) => acc + obj.issues.length,
                        0
                    );

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
                        const atName = testPlanReport.at.name;
                        const browserName = testPlanReport.browser.name;
                        const value = `${atName}_${browserName}`;

                        if (!coveredReports.includes(value))
                            coveredReports.push(value);
                    });

                    // Phase is "active"
                    insertActivePhaseForTestPlan(latestVersion);
                    return (
                        <PhaseCell>
                            <span className="version-string">
                                <a
                                    ref={candidateVersionStringRef}
                                    href={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        color="#2BA51C"
                                    />
                                    <b>
                                        V
                                        {convertDateToString(
                                            latestVersionDate,
                                            'YY.MM.DD'
                                        )}
                                    </b>
                                </a>
                            </span>
                            {shouldShowAdvanceButton && (
                                <Button
                                    ref={ref => setFocusRef(ref)}
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
                            <span className="more">
                                <span className="more-issues-container">
                                    <ReportStatusDot className="issues" />{' '}
                                    {issuesCount} Open Issue
                                    {`${issuesCount === 1 ? '' : 's'}`}
                                    {`${
                                        issuesCount >= 2
                                            ? ` from ${uniqueAtsCount} ATs`
                                            : ''
                                    }`}
                                </span>
                                <span className="target-days-container">
                                    Target{' '}
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
                                                    }, V${convertDateToString(
                                                        latestVersionDate,
                                                        'YY.MM.DD'
                                                    )}`,
                                                    dateText:
                                                        latestVersion.recommendedPhaseTargetDate
                                                });
                                            }}
                                        >
                                            {Math.abs(timeToTargetDate)} Days
                                        </button>
                                    ) : (
                                        <>
                                            <b>
                                                {Math.abs(timeToTargetDate)}{' '}
                                                Days
                                            </b>
                                        </>
                                    )}{' '}
                                    {timeToTargetDate < 0 ? 'Past' : 'Away'}
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
                    <PhaseCell>
                        <span className="version-string">
                            <FontAwesomeIcon
                                icon={faCircleCheck}
                                color="#2BA51C"
                            />
                            <a
                                ref={recommendedVersionStringRef}
                                href={`/test-review/${latestVersion.gitSha}/${latestVersion.testPlan.directory}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <b>
                                    V
                                    {convertDateToString(
                                        latestVersionDate,
                                        'YY.MM.DD'
                                    )}
                                </b>
                            </a>
                        </span>
                        <span className="review-complete">
                            Approved{' '}
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
                    <b>{testPlan.title}</b>
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
                            This version will be updated to{' '}
                            <b>{advanceModalData.phase}</b>.{' '}
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
                                                            {atName} and{' '}
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
