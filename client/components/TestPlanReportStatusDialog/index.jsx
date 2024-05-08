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

const AtInner = styled.div`
    display: inline-block;
    flex-wrap: wrap;
    background: #f5f5f5;
    border-radius: 4px;
    padding: 0 5px;
    font-weight: bold;

    & :last-of-type {
        margin-left: 6px;
        font-weight: initial;
    }
`;

const VersionBox = styled.span`
    /* font-size: 15px;
    color: #4a4a4a;
    top: 1px;
    position: relative; */
`;

const TestPlanReportStatusDialog = ({
    testPlanVersion,
    show,
    handleHide = () => {},
    triggerUpdate = () => {}
}) => {
    const { data: { me } = {} } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const { testPlanReportStatuses } = testPlanVersion;

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

    const renderReportStatus = ({
        testPlanReport,
        at,
        browser,
        minimumAtVersion,
        exactAtVersion
    }) => {
        if (testPlanReport) {
            const { markedFinalAt } = testPlanReport;
            if (markedFinalAt) {
                return renderCompleteReportStatus(testPlanReport);
            } else {
                return renderPartialCompleteReportStatus(testPlanReport);
            }
        }
        return (
            <>
                <IncompleteStatusReport>Missing</IncompleteStatusReport>
                {isSignedIn && isAdmin ? (
                    <AddTestToQueueWithConfirmation
                        at={at}
                        minimumAtVersion={minimumAtVersion}
                        exactAtVersion={exactAtVersion}
                        browser={browser}
                        testPlanVersion={testPlanVersion}
                        triggerUpdate={triggerUpdate}
                    />
                ) : null}
            </>
        );
    };

    let requiredReports = 0;

    const tableRows = testPlanReportStatuses.map(status => {
        const {
            isRequired,
            at,
            browser,
            minimumAtVersion,
            exactAtVersion,
            testPlanReport
        } = status;

        if (isRequired) requiredReports += 1;

        const key = `${at.name}-${browser.name}-${
            testPlanReport?.id ?? 'missing'
        }`;

        const atVersionFormatted = minimumAtVersion
            ? `${minimumAtVersion.name} or later`
            : exactAtVersion.name;

        return (
            <tr key={key}>
                <td>{isRequired ? 'Yes' : 'No'}</td>
                <td>
                    <AtInner>
                        {at.name}
                        <VersionBox>{atVersionFormatted}</VersionBox>
                    </AtInner>
                </td>
                <td>{browser.name}</td>
                <td>
                    {renderReportStatus({
                        testPlanReport,
                        at,
                        browser,
                        minimumAtVersion,
                        exactAtVersion
                    })}
                </td>
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
        testPlanReportStatuses: PropTypes.arrayOf(
            PropTypes.shape({
                at: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired,
                browser: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired,
                minimumAtVersion: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }),
                exactAtVersion: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }),
                testPlanReport: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    status: PropTypes.string,
                    runnableTests: PropTypes.arrayOf(PropTypes.object),
                    finalizedTestResults: PropTypes.arrayOf(PropTypes.object)
                })
            }).isRequired
        ).isRequired
    }).isRequired,
    handleHide: PropTypes.func.isRequired,
    triggerUpdate: PropTypes.func,
    show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
