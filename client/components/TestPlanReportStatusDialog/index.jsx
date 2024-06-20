import React from 'react';
import PropTypes from 'prop-types';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import { ThemeTable } from '../common/ThemeTable';
import BasicModal from '../common/BasicModal';
import './TestPlanReportStatusDialog.css';
import ReportStatusSummary from '../common/ReportStatusSummary';
import { AtVersion } from '../common/AtBrowserVersion';

const TestPlanReportStatusDialog = ({
    testPlanVersion,
    show,
    handleHide = () => {},
    triggerUpdate = () => {}
}) => {
    const { data: { me } = {} } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const auth = evaluateAuth(me);
    const { isSignedIn, isAdmin } = auth;

    const { testPlanReportStatuses } = testPlanVersion;

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

        const key =
            `${at.name}-${browser.name}-` +
            `${minimumAtVersion?.id ?? exactAtVersion?.id}-` +
            `${testPlanReport?.id ?? 'missing'}`;

        return (
            <tr key={key}>
                <td>{isRequired ? 'Yes' : 'No'}</td>
                <td>
                    <AtVersion
                        at={at}
                        minimumAtVersion={minimumAtVersion}
                        exactAtVersion={exactAtVersion}
                    />
                </td>
                <td>{browser.name}</td>
                <td>
                    <ReportStatusSummary
                        testPlanVersion={testPlanVersion}
                        testPlanReport={testPlanReport}
                    />
                    {isSignedIn && isAdmin && !testPlanReport ? (
                        <AddTestToQueueWithConfirmation
                            at={at}
                            minimumAtVersion={minimumAtVersion}
                            exactAtVersion={exactAtVersion}
                            browser={browser}
                            testPlanVersion={testPlanVersion}
                            triggerUpdate={triggerUpdate}
                        />
                    ) : null}
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
