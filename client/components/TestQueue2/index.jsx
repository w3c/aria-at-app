import React, { Fragment, useRef } from 'react';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import { TEST_QUEUE_PAGE_QUERY } from './queries';
import { Container, Table as BootstrapTable } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { evaluateAuth } from '../../utils/evaluateAuth';
import ManageTestQueue from '../ManageTestQueue';
import DisclosureComponentUnstyled from '../common/DisclosureComponent';
import useForceUpdate from '../../hooks/useForceUpdate';
import styled from '@emotion/styled';
import VersionString from '../common/VersionString';
import PhasePill from '../common/PhasePill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import TestPlanReportStatusDialogWithButton from '../TestPlanReportStatusDialog/WithButton';
import ReportStatusSummary from '../common/ReportStatusSummary';
import { AtVersion, BrowserVersion } from '../common/AtBrowserVersion';
import { calculatePercentComplete } from '../../utils/calculatePercentComplete';
import ProgressBar from '../common/ClippedProgressBar';
import AssignTesters from './AssignTesters';
import Actions from './Actions';

const DisclosureComponent = styled(DisclosureComponentUnstyled)`
    /* margin-top: 2em; */

    h3 {
        font-size: 1rem;

        button {
            font-size: unset;
            font-weight: unset;
        }
    }

    [role='region'] {
        padding: 0;
    }
`;

const MetadataContainer = styled.div`
    display: flex;
    gap: 1.25em;
    margin: 0.5rem 1.25rem;
    align-items: center;

    & button {
        margin-bottom: 0;
        margin-top: 0;
        font-size: 16px;
    }
    & button:hover {
        color: white;
    }
    & button,
    & button:focus {
        color: #2e2f33;
    }
`;

const TableOverflowContainer = styled.div`
    width: 100%;

    @media (max-width: 1080px) {
        overflow-x: scroll;
    }
`;

const Table = styled(BootstrapTable)`
    margin-bottom: 0;

    th {
        padding: 0.75rem;
    }

    th:first-of-type,
    td:first-of-type {
        border-left: none;
    }
    th:last-of-type,
    td:last-of-type {
        border-right: none;
    }
    tr:last-of-type,
    tr:last-of-type td {
        border-bottom: none;
    }

    th:nth-of-type(1),
    td:nth-of-type(1) {
        min-width: 220px;
    }
    th:nth-of-type(2),
    td:nth-of-type(2) {
        min-width: 150px;
    }
    th:nth-of-type(3),
    td:nth-of-type(3) {
        min-width: 230px;
    }
    th:nth-of-type(4),
    td:nth-of-type(4) {
        width: 20%;
        min-width: 125px;
    }
    th:nth-of-type(5),
    td:nth-of-type(5) {
        width: 20%;
        min-width: 175px;
    }
`;

const StatusContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    color: rgb(var(--bs-secondary-rgb));
`;

const TestQueue = () => {
    const { data, error, refetch } = useQuery(TEST_QUEUE_PAGE_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const openDisclosuresRef = useRef({});
    const forceUpdate = useForceUpdate();

    if (error) {
        return (
            <PageStatus
                title="Test Queue | ARIA-AT"
                heading="Test Queue"
                message={error.message}
                isError
            />
        );
    }

    if (!data) {
        return (
            <PageStatus
                title="Loading - Test Queue | ARIA-AT"
                heading="Test Queue"
            />
        );
    }

    const isSignedIn = !!data.me;

    const { isAdmin } = evaluateAuth(data.me);

    const testPlanVersions = [];
    data.testPlans.forEach(testPlan => {
        // testPlan.directory is needed by ManageTestQueue
        const populatedTestPlanVersions = testPlan.testPlanVersions.map(
            testPlanVersion => ({
                ...testPlanVersion,
                testPlan: { directory: testPlan.directory }
            })
        );
        testPlanVersions.push(...populatedTestPlanVersions);
    });

    // Remove any test plans or test plan versions without reports and sort

    const sortTestPlanVersions = testPlanVersions => {
        return [...testPlanVersions]
            .filter(testPlanVersion => testPlanVersion.testPlanReports.length)
            .sort((a, b) => {
                return a.versionString.localeCompare(b.versionString);
            })
            .map(testPlanVersion => {
                return {
                    ...testPlanVersion,
                    testPlanReports: sortTestPlanReports(
                        testPlanVersion.testPlanReports
                    )
                };
            });
    };

    const sortTestPlanReports = testPlanReports => {
        return [...testPlanReports].sort((a, b) => {
            if (a.at.name !== b.at.name) {
                return a.at.name.localeCompare(b.at.name);
            }
            if (a.browser.name !== b.browser.name) {
                return a.browser.name.localeCompare(b.browser.name);
            }
            const dateA = new Date(
                (a.minimumAtVersion ?? a.exactAtVersion).releasedAt
            );
            const dateB = new Date(
                (a.minimumAtVersion ?? a.exactAtVersion).releasedAt
            );
            return dateB - dateA;
        });
    };

    const testPlans = data.testPlans
        .filter(testPlan => {
            for (const testPlanVersion of testPlan.testPlanVersions) {
                if (testPlanVersion.testPlanReports.length) return true;
            }
        })
        .map(testPlan => {
            return {
                ...testPlan,
                testPlanVersions: sortTestPlanVersions(
                    testPlan.testPlanVersions
                )
            };
        })
        .sort((a, b) => {
            return a.title.localeCompare(b.title);
        });

    const testers = data.users
        .filter(user => user.roles.includes('TESTER'))
        .sort((a, b) => a.username.localeCompare(b.username));

    const renderDisclosure = ({ testPlan }) => {
        return (
            // TODO: fix the aria-label of this
            <DisclosureComponent
                componentId={testPlan.directory}
                stacked
                title={testPlan.testPlanVersions.map(testPlanVersion => (
                    <>
                        <VersionString
                            iconColor="#2BA51C"
                            fullWidth={false}
                            autoWidth={false}
                        >
                            {testPlanVersion.versionString}
                        </VersionString>
                        &nbsp;
                        <PhasePill fullWidth={false}>
                            {testPlanVersion.phase}
                        </PhasePill>
                    </>
                ))}
                onClick={testPlan.testPlanVersions.map(
                    testPlanVersion => () => {
                        const isOpen =
                            openDisclosuresRef.current[testPlanVersion.id];
                        openDisclosuresRef.current[testPlanVersion.id] =
                            !isOpen;
                        forceUpdate();
                    }
                )}
                expanded={testPlan.testPlanVersions.map(
                    testPlanVersion =>
                        openDisclosuresRef.current[testPlanVersion.id]
                )}
                disclosureContainerView={testPlan.testPlanVersions.map(
                    testPlanVersion =>
                        renderDisclosureContent({ testPlan, testPlanVersion })
                )}
            />
        );
    };

    const renderDisclosureContent = ({ testPlan, testPlanVersion }) => {
        return (
            <>
                <MetadataContainer>
                    <a href={`/test-review/${testPlanVersion.id}`}>
                        <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            size="xs"
                            color="#818F98"
                        />
                        View tests in {testPlanVersion.versionString}
                    </a>
                    <TestPlanReportStatusDialogWithButton
                        triggerUpdate={refetch}
                        testPlanVersionId={testPlanVersion.id}
                    />
                </MetadataContainer>
                <TableOverflowContainer>
                    <Table
                        aria-label={
                            `Reports for ${testPlanVersion.title} ` +
                            `${testPlanVersion.versionString} in ` +
                            `${testPlanVersion.phase.toLowerCase()} phase`
                        }
                        bordered
                        hover={false}
                    >
                        <thead>
                            <tr>
                                <th>Assistive Technology</th>
                                <th>Browser</th>
                                <th>Testers</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testPlanVersion.testPlanReports.map(
                                testPlanReport =>
                                    renderRow({
                                        testPlan,
                                        testPlanVersion,
                                        testPlanReport
                                    })
                            )}
                        </tbody>
                    </Table>
                </TableOverflowContainer>
            </>
        );
    };

    const renderRow = ({ testPlan, testPlanVersion, testPlanReport }) => {
        const percentComplete = calculatePercentComplete(testPlanReport);

        return (
            <tr key={testPlanReport.id}>
                <td>
                    <AtVersion
                        at={testPlanReport.at}
                        minimumAtVersion={testPlanReport.minimumAtVersion}
                        exactAtVersion={testPlanReport.exactAtVersion}
                    />
                </td>
                <td>
                    <BrowserVersion browser={testPlanReport.browser} />
                </td>
                <td>
                    <AssignTesters
                        me={data.me}
                        testers={testers}
                        testPlanReport={testPlanReport}
                    />
                </td>
                <td>
                    <StatusContainer>
                        {<ProgressBar progress={percentComplete} decorative />}
                        <ReportStatusSummary
                            testPlanVersion={testPlanVersion}
                            testPlanReport={testPlanReport}
                        />
                    </StatusContainer>
                </td>
                <td>
                    <Actions
                        me={data.me}
                        testPlanReport={testPlanReport}
                        testPlan={testPlan}
                    />
                </td>
            </tr>
        );
    };

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Test Queue | ARIA-AT</title>
            </Helmet>
            <h1>Test Queue</h1>
            <p>
                {isSignedIn
                    ? 'Assign yourself a test plan or start executing one that is already assigned to you.'
                    : 'Select a test plan to view. Your results will not be saved.'}
            </p>
            {isAdmin && (
                <ManageTestQueue
                    ats={data.ats}
                    testPlanVersions={testPlanVersions}
                    triggerUpdate={refetch}
                />
            )}

            {!testPlans.length
                ? 'There are currently no test plan reports to show.'
                : testPlans.map(testPlan => (
                      <Fragment key={testPlan.directory}>
                          {/* ID needed for recovering focus after deleting a report */}
                          <h2 tabIndex="-1" id={testPlan.directory}>
                              {testPlan.title}
                          </h2>
                          {renderDisclosure({ testPlan })}
                      </Fragment>
                  ))}
        </Container>
    );
};

export default TestQueue;
