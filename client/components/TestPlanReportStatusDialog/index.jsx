import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import { calculateTestPlanReportCompletionPercentage } from './calculateTestPlanReportCompletionPercentage';
import { convertDateToString } from '../../utils/formatter';
import { ThemeTable } from '../common/ThemeTable';
import BasicModal from '../common/BasicModal';
import './TestPlanReportStatusDialog.css';

const IncompleteStatusReport = styled.span`
    min-width: 5rem;
    display: inline-block;
`;

const TestPlanReportStatusDialog = ({
    testPlanVersion,
    show,
    ats,
    handleHide = () => {},
    triggerUpdate = () => {}
}) => {
    const { data: { me } = {} } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const { testPlanReports } = testPlanVersion;

    const auth = evaluateAuth(me ?? {});
    const { isSignedIn, isAdmin } = auth;

    const renderCompleteReportStatus = testPlanReport => {
        const formattedDate = convertDateToString(
            testPlanReport.markedFinalAt,
            'MMM D, YYYY'
        );
        return (
            <a
                href={`/report/${testPlanVersion.id}/targets/${testPlanReport.id}`}
            >
                Report completed on <strong>{formattedDate}</strong>
            </a>
        );
    };

    const renderPartialCompleteReportStatus = testPlanReport => {
        const { metrics, draftTestPlanRuns } = testPlanReport;
        const conflictsCount = metrics.conflictsCount ?? 0;
        const percentComplete =
            calculateTestPlanReportCompletionPercentage(testPlanReport);
        switch (draftTestPlanRuns?.length) {
            case 0:
                return <span>In test queue with no testers assigned.</span>;
            case 1:
                return (
                    <span>
                        {percentComplete}% complete by&nbsp;
                        <a
                            href={`https://github.com/${draftTestPlanRuns[0].tester.username}`}
                        >
                            {draftTestPlanRuns[0].tester.username}
                        </a>
                        &nbsp;with {conflictsCount} conflicts
                    </span>
                );
            default:
                return (
                    <span>
                        {percentComplete}% complete by&nbsp;
                        {draftTestPlanRuns.length} testers with {conflictsCount}
                        &nbsp;conflicts
                    </span>
                );
        }
    };

    const renderReportStatus = ({ report, at, browser }) => {
        if (report) {
            const { markedFinalAt } = report;
            if (markedFinalAt) {
                return renderCompleteReportStatus(report);
            } else {
                return renderPartialCompleteReportStatus(report);
            }
        }
        return (
            <>
                <IncompleteStatusReport>Missing</IncompleteStatusReport>
                {isSignedIn && isAdmin ? (
                    <AddTestToQueueWithConfirmation
                        at={at}
                        browser={browser}
                        testPlanVersion={testPlanVersion}
                        triggerUpdate={triggerUpdate}
                    />
                ) : null}
            </>
        );
    };

    let requiredReports = 0;
    const rowData = [];

    ats.forEach(at => {
        // DRAFT as well because those reports are required to be promoted to CANDIDATE
        if (
            testPlanVersion.phase === 'DRAFT' ||
            testPlanVersion.phase === 'CANDIDATE'
        ) {
            requiredReports += at.candidateBrowsers.length;
        }
        if (testPlanVersion.phase === 'RECOMMENDED') {
            requiredReports += at.recommendedBrowsers.length;
        }

        at.browsers.forEach(browser => {
            const report = testPlanReports.find(eachReport => {
                return (
                    eachReport.at.id === at.id &&
                    eachReport.browser.id === browser.id
                );
            });

            let isRequired = false;
            if (
                testPlanVersion.phase === 'DRAFT' ||
                testPlanVersion.phase === 'CANDIDATE'
            ) {
                isRequired = at.candidateBrowsers.some(candidateBrowser => {
                    return candidateBrowser.id === browser.id;
                });
            } else if (testPlanVersion.phase === 'RECOMMENDED') {
                isRequired = at.recommendedBrowsers.some(recommendedBrowser => {
                    return recommendedBrowser.id === browser.id;
                });
            }
            rowData.push({ report, at, browser, isRequired });
        });
    });

    // Sort by required then AT then browser
    rowData.sort((a, b) => {
        if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
        if (a.at.name !== b.at.name) return a.at.name.localeCompare(b.at.name);
        return a.browser.name.localeCompare(b.browser.name);
    });
    const tableRows = rowData.map(({ report, at, browser, isRequired }) => {
        return (
            <tr key={`${at.name}-${browser.name}`}>
                <td>{isRequired ? 'Yes' : 'No'}</td>
                <td>{at.name}</td>
                <td>{browser.name}</td>
                <td>{renderReportStatus({ report, at, browser })}</td>
            </tr>
        );
    });

    const getContent = () => {
        const phase = testPlanVersion.phase;

        const getDescriptions = phase => {
            if (phase === 'DRAFT')
                return [
                    'Review phase',
                    'required to be promoted to the next phase'
                ];
            if (phase === 'CANDIDATE')
                return ['Review phase', 'require reports in this phase'];
            if (phase === 'RECOMMENDED')
                return ['phase', 'require reports in this phase'];
        };

        const [reviewDescription, requirementNeedsDescription] =
            getDescriptions(phase);

        return (
            <>
                {phase && (
                    <p>
                        This plan is in the&nbsp;
                        <span
                            className={`status-label d-inline ${
                                phase === 'DRAFT' ? 'not-started' : 'complete'
                            }`}
                        >
                            {/* text-transform: capitalize will not work on all-caps string */}
                            {phase[0] + phase.slice(1).toLowerCase()}
                        </span>
                        &nbsp;{reviewDescription}.&nbsp;
                        <strong>{requiredReports} AT/browser&nbsp;</strong>
                        pairs {requirementNeedsDescription}.
                    </p>
                )}

                <ThemeTable bordered responsive>
                    <thead>
                        <tr>
                            <th>Required</th>
                            <th>AT</th>
                            <th>Browser</th>
                            <th>Report Status</th>
                        </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                </ThemeTable>
            </>
        );
    };

    const getTitle = () => (
        <>
            Report Status for the&nbsp;
            <strong>{testPlanVersion.title}</strong>
            &nbsp;Test Plan
        </>
    );

    return (
        <BasicModal
            show={show}
            handleHide={handleHide}
            useOnHide={true}
            animation={false}
            centered
            dialogClassName="test-plan-report-status-dialog p-3"
            content={getContent()}
            title={getTitle()}
        />
    );
};

TestPlanReportStatusDialog.propTypes = {
    testPlanVersion: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        phase: PropTypes.string.isRequired,
        testPlanReports: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                status: PropTypes.string,
                runnableTests: PropTypes.arrayOf(PropTypes.object),
                finalizedTestResults: PropTypes.arrayOf(PropTypes.object),
                at: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired,
                browser: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired
            }).isRequired
        ).isRequired
    }).isRequired,
    handleHide: PropTypes.func.isRequired,
    triggerUpdate: PropTypes.func,
    show: PropTypes.bool.isRequired,
    ats: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            browsers: PropTypes.arrayOf(
                PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired
            ).isRequired,
            candidateBrowsers: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired
                }).isRequired
            ).isRequired,
            recommendedBrowsers: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired
                }).isRequired
            ).isRequired
        }).isRequired
    ).isRequired
};

export default TestPlanReportStatusDialog;
