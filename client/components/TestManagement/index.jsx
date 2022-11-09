import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert, Dropdown } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import nextId from 'react-id-generator';
import { TEST_MANAGEMENT_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import ManageTestQueue from '../ManageTestQueue';
import DisclosureComponent from '@components/common/DisclosureComponent';
import './TestManagement.css';

const PhaseText = styled.span`
    font-size: 14px;
    margin-left: 4px;
    padding: 4px 8px;
    border-radius: 14px;
    overflow: hidden;
    white-space: nowrap;
    color: white;

    &.draft {
        background: #838f97;
    }

    &.candidate {
        background: #f87f1b;
    }

    &.recommended {
        background: #b253f8;
    }
`;

const PhaseDot = styled.span`
    display: inline-block;
    height: 10px;
    width: 10px;
    padding: 0;
    margin-right: 8px;
    border-radius: 50%;

    &.draft {
        background: #838f97;
    }

    &.candidate {
        background: #f87f1b;
    }

    &.recommended {
        background: #b253f8;
    }
`;

const TestManagement = () => {
    const { loading, data, error, refetch } = useQuery(
        TEST_MANAGEMENT_PAGE_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    const [pageReady, setPageReady] = useState(false);

    const [ats, setAts] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);

    const [
        summaryGroupedTestPlanReports,
        setSummaryGroupedTestPlanReports
    ] = useState({});

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlanReports = []
            } = data;
            setAts(ats);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);
            setBrowsers(browsers);
            setPageReady(true);
        }
    }, [data]);

    useEffect(() => {
        const jawsGroup = testPlanReports.filter(t => t.at.id == 1);
        const nvdaGroup = testPlanReports.filter(t => t.at.id == 2);
        const voGroup = testPlanReports.filter(t => t.at.id == 3);

        const groupedData = atGroup => {
            let allResultGroup = {};
            let summaryResultGroup = {};

            atGroup.forEach(t => {
                const testPlanId = t.testPlanVersion.testPlan.directory;
                if (!allResultGroup[testPlanId])
                    allResultGroup[testPlanId] = [t];
                else allResultGroup[testPlanId].push(t);

                if (!summaryResultGroup[testPlanId])
                    summaryResultGroup[testPlanId] = t;
                else if (
                    new Date(t.testPlanVersion.updatedAt) >
                    new Date(
                        summaryResultGroup[testPlanId].testPlanVersion.updatedAt
                    )
                ) {
                    summaryResultGroup[testPlanId] = t;
                }
            });

            return { allResultGroup, summaryResultGroup };
        };

        const {
            allResultGroup: allJawsGroupedByTestPlan,
            summaryResultGroup: summaryJawsGroupedByTestPlan
        } = groupedData(jawsGroup);
        const {
            allResultGroup: allNvdaGroupedByTestPlan,
            summaryResultGroup: summaryNvdaGroupedByTestPlan
        } = groupedData(nvdaGroup);
        const {
            allResultGroup: allVoGroupedByTestPlan,
            summaryResultGroup: summaryVoGroupedByTestPlan
        } = groupedData(voGroup);

        // eslint-disable-next-line
        const allGroupedTestPlanReports = {
            jaws: allJawsGroupedByTestPlan,
            nvda: allNvdaGroupedByTestPlan,
            vo: allVoGroupedByTestPlan
        };

        const summaryGroupedTestPlanReports = {
            jaws: summaryJawsGroupedByTestPlan,
            nvda: summaryNvdaGroupedByTestPlan,
            vo: summaryVoGroupedByTestPlan
        };

        setSummaryGroupedTestPlanReports(summaryGroupedTestPlanReports);
    }, [testPlanReports]);

    if (error) {
        return (
            <PageStatus
                title="Test Management | ARIA-AT"
                heading="Test Management"
                message={error.message}
                isError
            />
        );
    }

    if (loading || !pageReady) {
        return (
            <PageStatus
                title="Loading - Test Management | ARIA-AT"
                heading="Test Management"
            />
        );
    }

    const constructStatusSummaryData = () => {
        let result = {};

        // Arrange the summary data by example
        Object.keys(summaryGroupedTestPlanReports).forEach(atKey => {
            Object.keys(summaryGroupedTestPlanReports[atKey]).forEach(
                exampleKey => {
                    if (!result[exampleKey]) result[exampleKey] = {};
                    result[exampleKey][atKey] =
                        summaryGroupedTestPlanReports[atKey][exampleKey];
                }
            );
        });

        return result;
    };

    const emptyTestPlans = !testPlanReports.length;
    const summaryData = constructStatusSummaryData();

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Test Management | ARIA-AT</title>
            </Helmet>
            <h1>Test Management</h1>

            {emptyTestPlans && (
                <h2 data-testid="test-management-no-test-plans-h2">
                    There are no test plans available
                </h2>
            )}

            {emptyTestPlans && (
                <Alert
                    key="alert-configure"
                    variant="danger"
                    data-testid="test-management-no-test-plans-p"
                >
                    Add a Test Plan to the Queue
                </Alert>
            )}

            <p data-testid="test-management-instructions">
                TODO: This text needs to be updated.
            </p>

            <ManageTestQueue
                ats={ats}
                browsers={browsers}
                testPlanVersions={testPlanVersions}
                triggerUpdate={refetch}
            />

            <br />
            <br />
            <DisclosureComponent
                componentId="test-management"
                title="Status Summary"
                expanded
                disclosureContainerView={
                    <>
                        <Table
                            className="test-management"
                            aria-label="Status Summary Table"
                            striped
                            bordered
                            hover
                        >
                            <thead>
                                <tr>
                                    <th>Test Plans</th>
                                    <th>Phase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(summaryData).map(k => {
                                    const summaryItem = summaryData[k];
                                    const atItems = Object.values(summaryItem);

                                    let phase = 'Draft';
                                    // eslint-disable-next-line
                                    if (atItems.every(i => i.status === 'FINALIZED')) phase = 'Recommended';
                                    // eslint-disable-next-line
                                    else if (atItems.every(i => i.status === 'IN_REVIEW')) phase = 'Candidate';
                                    // eslint-disable-next-line
                                    else if (atItems.some(i => i.status === 'IN_REVIEW')) phase = 'Candidate';

                                    const key = `summary-table-item-${k}`;
                                    // TODO: Should the length of the tests be
                                    //       relevant here since the count can
                                    //       vary for each AT?
                                    // TODO: What does clicking the Test Plan
                                    //       link to?
                                    // TODO: Will show the test plan phase which
                                    //       is at the lowest
                                    return (
                                        <tr key={key}>
                                            <th>
                                                {
                                                    atItems[0].testPlanVersion
                                                        .title
                                                }
                                                {/*{`${*/}
                                                {/*    atItems[0].testPlanVersion*/}
                                                {/*        .title*/}
                                                {/*} (${Math.max(*/}
                                                {/*    ...atItems.map(*/}
                                                {/*        i =>*/}
                                                {/*            i.runnableTestsLength*/}
                                                {/*    )*/}
                                                {/*)} Tests)`}*/}
                                                <PhaseText
                                                    className={phase.toLowerCase()}
                                                >
                                                    {phase}
                                                </PhaseText>
                                            </th>
                                            <td>
                                                <Dropdown className="change-phase">
                                                    <Dropdown.Toggle
                                                        id={nextId()}
                                                        variant="secondary"
                                                        aria-label="Change test plan phase"
                                                    >
                                                        <PhaseDot
                                                            className={phase.toLowerCase()}
                                                        />
                                                        {phase}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu role="menu">
                                                        <Dropdown.Item
                                                            role="menuitem"
                                                            disabled={
                                                                phase ===
                                                                'Draft'
                                                            }
                                                        >
                                                            <PhaseDot className="draft" />
                                                            Draft
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            role="menuitem"
                                                            disabled={
                                                                phase ===
                                                                'Candidate'
                                                            }
                                                        >
                                                            <PhaseDot className="candidate" />
                                                            Candidate
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            role="menuitem"
                                                            disabled={
                                                                phase ===
                                                                'Recommended'
                                                            }
                                                        >
                                                            <PhaseDot className="recommended" />
                                                            Recommended
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </>
                }
            />
        </Container>
    );
};

export default TestManagement;
