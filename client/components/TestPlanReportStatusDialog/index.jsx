import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { getRequiredReports } from './isRequired';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import getMetrics from '../Reports/getMetrics';
import { calculateTestPlanReportCompletionPercentage } from './calculateTestPlanReportCompletionPercentage';
import { convertDateToString } from '../../utils/formatter';
import { ThemeTable } from '../common/ThemeTable';
import BasicModal from '../common/BasicModal';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from './queries';

import './TestPlanReportStatusDialog.css';
import { at } from 'lodash';

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

    const requiredReports = useMemo(
        () => getRequiredReports(testPlanVersion?.phase),
        [testPlanVersion]
    );

    // section:
    // Declare array of all reports
    const allReports = ats
        .map(at =>
            at.browsers.map(browser => ({
                browser: { name: browser.name, id: browser.id },
                at: { name: at.name, id: at.id }
            }))
        )
        .flat();

    const requiredReportIds = requiredReports.map(
        report => `${report.at.id}-${report.browser.id}`
    );

    const newOthers = allReports.filter(report => {
        return !requiredReportIds.includes(
            `${report.at.id}-${report.browser.id}`
        );
    });

    // section:
    const [matchedReports, unmatchedTestPlanReports, unmatchedRequiredReports] =
        useMemo(() => {
            const matched = [];
            const unmatchedTestPlan = [...testPlanReports];
            const unmatchedRequired = [...requiredReports];

            for (let i = 0; i < requiredReports.length; i++) {
                for (let j = 0; j < testPlanReports.length; j++) {
                    if (
                        requiredReports[i].at.name ===
                            testPlanReports[j].at.name &&
                        requiredReports[i].browser.name ===
                            testPlanReports[j].browser.name
                    ) {
                        matched.push(testPlanReports[j]);

                        unmatchedTestPlan.splice(
                            unmatchedTestPlan.indexOf(testPlanReports[j]),
                            1
                        );
                        unmatchedRequired.splice(
                            unmatchedRequired.indexOf(requiredReports[i]),
                            1
                        );
                        break;
                    }
                }
            }
            return [matched, unmatchedTestPlan, unmatchedRequired];
        }, [testPlanReports, requiredReports]);

    // section:
    if (newOthers.length > 0) {
        let index = 0;
        newOthers.forEach(otherReport => {
            if (matchedReports.length > 0) {
                matchedReports.forEach(matchedReport => {
                    if (
                        otherReport.at.id === matchedReport.id &&
                        otherReport.browser.id === matchedReport.browser.id
                    ) {
                        delete newOthers[index];
                    }
                });
            }
            index += 1;
        });
    }

    if (newOthers.length > 0) {
        let index = 0;
        newOthers.forEach(otherReport => {
            if (unmatchedTestPlanReports.length > 0) {
                unmatchedTestPlanReports.forEach(unmatchedTestPlanReport => {
                    if (
                        otherReport.at.id === unmatchedTestPlanReport.at.id &&
                        otherReport.browser.id ===
                            unmatchedTestPlanReport.browser.id
                    ) {
                        delete newOthers[index];
                    }
                });
            }
            index += 1;
        });
    }

    if (newOthers.length > 0) {
        let index = 0;
        newOthers.forEach(otherReport => {
            if (unmatchedRequiredReports.length > 0) {
                unmatchedRequiredReports.forEach(unmatchedRequiredReport => {
                    if (
                        otherReport.at.id === unmatchedRequiredReport.id &&
                        otherReport.browser.id ===
                            unmatchedRequiredReport.browser.id
                    ) {
                        newOthers.splice(index, 1);
                    }
                });
            }
            index += 1;
        });
    }


    const renderTableRow = (testPlanReport, required = 'Yes') => {
        return (
            <tr
                key={`${testPlanReport.at.name}-${testPlanReport.browser.name}`}
            >
                <td>{required}</td>
                <td>{testPlanReport.at.name}</td>
                <td>{testPlanReport.browser.name}</td>
                <td>{renderReportStatus(testPlanReport)}</td>
            </tr>
        );
    };

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

    const renderReportStatus = testPlanReport => {
        const { metrics, at, browser, markedFinalAt } = testPlanReport;
        const { phase } = testPlanVersion;
        if (metrics) {
            if (
                markedFinalAt &&
                (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
            ) {
                return renderCompleteReportStatus(testPlanReport);
            } else {
                return renderPartialCompleteReportStatus(testPlanReport);
            }
        } else {
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
        }
    };

    const getContent = () => (
        <>
            {testPlanVersion.phase && (
                <p>
                    This plan is in the&nbsp;
                    <span
                        className={`status-label d-inline ${
                            testPlanVersion.phase === 'DRAFT'
                                ? 'not-started'
                                : 'complete'
                        }`}
                    >
                        {/* text-transform: capitalize will not work on all-caps string */}
                        {testPlanVersion.phase[0] +
                            testPlanVersion.phase.slice(1).toLowerCase()}
                    </span>
                    &nbsp;Review phase.&nbsp;
                    {/* <strong>{requiredReports.length} AT/browser&nbsp;</strong> */}
                    pairs require reports in this phase.
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
                <tbody>
                    {/* section: */}
                    {matchedReports.map(report => renderTableRow(report))}
                    {unmatchedRequiredReports.map(report =>
                        renderTableRow(report)
                    )}
                    {newOthers.map(report => renderTableRow(report, 'No'))}
                    {unmatchedTestPlanReports.map(report =>
                        renderTableRow(report, 'No')
                    )}
                </tbody>
            </ThemeTable>
        </>
    );

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
    show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
