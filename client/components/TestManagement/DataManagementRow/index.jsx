import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useMutation } from '@apollo/client';
import { LoadingStatus, useTriggerLoad } from '../../common/LoadingStatus';
import { convertDateToString } from '@client/utils/formatter';

const DataManagementRow = ({ testPlan, testPlanVersions, testPlanReports }) => {
    const { triggerLoad, loadingMessage } = useTriggerLoad();

    const rdTestPlanVersions = testPlanVersions.filter(
        ({ phase }) => phase === 'RD'
    );
    const draftTestPlanVersions = testPlanVersions.filter(
        ({ phase }) => phase === 'DRAFT'
    );
    const candidateTestPlanVersions = testPlanVersions.filter(
        ({ phase }) => phase === 'CANDIDATE'
    );
    const recommendedTestPlanVersions = testPlanVersions.filter(
        ({ phase }) => phase === 'RECOMMENDED'
    );

    const renderCellForStatus = () => {
        let view;
        let earliestVersion;
        let earliestVersionDate = new Date();

        for (const testPlanVersion of testPlanVersions) {
            const {
                phase,
                updatedAt,
                draftPhaseReachedAt,
                candidatePhaseReachedAt,
                recommendedPhaseReachedAt
            } = testPlanVersion;

            if (phase === 'RECOMMENDED') {
                if (
                    new Date(recommendedPhaseReachedAt) <
                    new Date(earliestVersionDate)
                ) {
                    earliestVersion = testPlanVersion;
                    earliestVersionDate = recommendedPhaseReachedAt;
                    view = (
                        <>
                            Recommended Since{' '}
                            {convertDateToString(
                                earliestVersionDate,
                                'MMM D, YYYY'
                            )}
                        </>
                    );
                }
            } else if (phase === 'CANDIDATE') {
                if (
                    new Date(candidatePhaseReachedAt) <
                    new Date(earliestVersionDate)
                ) {
                    earliestVersion = testPlanVersion;
                    earliestVersionDate = candidatePhaseReachedAt;
                    view = (
                        <>
                            Candidate Review Started{' '}
                            {convertDateToString(
                                earliestVersionDate,
                                'MMM D, YYYY'
                            )}
                        </>
                    );
                }
            } else if (phase === 'DRAFT') {
                if (
                    new Date(draftPhaseReachedAt) <
                    new Date(earliestVersionDate)
                ) {
                    earliestVersion = testPlanVersion;
                    earliestVersionDate = draftPhaseReachedAt;
                    view = (
                        <>
                            Draft Review Started{' '}
                            {convertDateToString(
                                earliestVersionDate,
                                'MMM D, YYYY'
                            )}
                        </>
                    );
                }
            } else if (phase === 'RD') {
                if (new Date(updatedAt) < new Date(earliestVersionDate)) {
                    earliestVersion = testPlanVersion;
                    earliestVersionDate = updatedAt;
                    view = (
                        <>
                            R&D Complete on{' '}
                            {convertDateToString(
                                earliestVersionDate,
                                'MMM D, YYYY'
                            )}
                        </>
                    );
                }
            }
        }
        return view;
    };

    const renderCellForPhase = (phase, testPlanVersions = []) => {
        const defaultView = <>N/A</>;

        // Get the latest version information on the TestPlanVersions
        const getLatestVersionData = testPlanVersions => {
            const latestVersion = testPlanVersions.reduce((a, b) =>
                new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
            );
            const latestVersionDate = latestVersion.updatedAt;

            return { latestVersion, latestVersionDate };
        };

        switch (phase) {
            case 'RD': {
                // If the latest version of the plan is in the draft, candidate, or recommended
                // phase, show string "N/A". This should also apply if there is no R&D phase
                // TestPlanVersions
                if (!testPlanVersions.length) return defaultView;

                const otherTestPlanVersions = [
                    ...draftTestPlanVersions,
                    ...candidateTestPlanVersions,
                    ...recommendedTestPlanVersions
                ];

                const { latestVersion, latestVersionDate } =
                    getLatestVersionData(testPlanVersions);

                for (const otherTestPlanVersion of otherTestPlanVersions) {
                    if (
                        new Date(otherTestPlanVersion.updatedAt) >
                        new Date(latestVersionDate)
                    ) {
                        return defaultView;
                    }
                }

                // Otherwise, show VERSION_STRING link with a draft transition button
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
                        <button>Advance to Draft</button>
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
                // Candidate" button
                if (testPlanVersions.length) {
                    const { latestVersion, latestVersionDate } =
                        getLatestVersionData(testPlanVersions);

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
                            <button>Advance to Candidate</button>
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
                    } = getLatestVersionData(otherTestPlanVersions);

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
                        getLatestVersionData(testPlanVersions);

                    const filteredTestPlanReports = testPlanReports.filter(
                        testPlanReport =>
                            testPlanReport.testPlanVersion.id ===
                            latestVersion.id
                    );
                    const issuesCount = filteredTestPlanReports.reduce(
                        (acc, obj) => acc + obj.issues.length,
                        0
                    );

                    const uniqueAtObjects = {};
                    filteredTestPlanReports.forEach(testPlanReport => {
                        const atId = testPlanReport.at.id;
                        if (!uniqueAtObjects[atId]) {
                            uniqueAtObjects[atId] = testPlanReport.at;
                        }
                    });
                    const uniqueAtsCount = Object.keys(uniqueAtObjects).length;

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
                            <button>Advance to Recommended</button>
                        </>
                    );
                }

                // If a version of the plan is not in the candidate phase and there is a recommended
                // version, show string "Review of VERSION_STRING completed DATE"
                if (otherTestPlanVersions.length) {
                    const {
                        latestVersion: otherLatestVersion,
                        latestVersionDate: otherLatestVersionDate
                    } = getLatestVersionData(otherTestPlanVersions);

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
                    getLatestVersionData(testPlanVersions);

                const completionDate = latestVersion.recommendedPhaseReachedAt;

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
                    </>
                );
            }
        }
    };

    return (
        <LoadingStatus message={loadingMessage}>
            <tr>
                <th>{testPlan.title}</th>
                <td>
                    <button>3 Desktop Screen Readers</button>
                </td>
                <td>{renderCellForStatus()}</td>
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
        </LoadingStatus>
    );
};

DataManagementRow.propTypes = {};

export default DataManagementRow;
