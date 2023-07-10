import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { TEST_MANAGEMENT_PAGE_QUERY } from './queries';
import StatusSummaryRow from './StatusSummaryRow';
import PageStatus from '../common/PageStatus';
import DisclosureComponent from '../common/DisclosureComponent';
import ManageTestQueue from '../ManageTestQueue';
import alphabetizeObjectBy from '@client/utils/alphabetizeObjectBy';
import {
    getTestPlanTargetTitle,
    getTestPlanVersionTitle
} from '@components/Reports/getTitles';
import DataManagementRow from '@components/TestManagement/DataManagementRow';
import './TestManagement.css';

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
    const [testPlans, setTestPlans] = useState([]);
    const [testPlanVersions, setTestPlanVersions] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);

    // eg. { 1: { DRAFT: null, CANDIDATE: { ... } }, 2: { RD: ..., CANDIDATE: ..., RECOMMENDED: ... }, ... }
    const [activePhasesByTestPlan, setActivePhasesByTestPlan] = useState({});

    useEffect(() => {
        if (data) {
            const {
                ats = [],
                browsers = [],
                testPlanVersions = [],
                testPlanReports = [],
                testPlans = []
            } = data;
            setAts(ats);
            setBrowsers(browsers);
            setTestPlans(testPlans);
            setTestPlanVersions(testPlanVersions);
            setTestPlanReports(testPlanReports);

            // eg. { 1: { DRAFT: null, CANDIDATE: { ... } }, 2: { RD: ..., CANDIDATE: ..., RECOMMENDED: ... }, ... }
            const activePhasesByTestPlan = {};
            testPlans.forEach(testPlan => {
                activePhasesByTestPlan[testPlan.id] = {};
            });
            setActivePhasesByTestPlan(activePhasesByTestPlan);

            setPageReady(true);
        }
    }, [data]);

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

    const emptyTestPlans = !testPlanReports.length;

    const testPlanReportsById = {};
    let testPlanTargetsById = {};
    let testPlanVersionsById = {};
    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        testPlanReportsById[testPlanReport.id] = testPlanReport;
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
        testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
    });
    testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
        getTestPlanTargetTitle(keyValue[1])
    );
    testPlanVersionsById = alphabetizeObjectBy(testPlanVersionsById, keyValue =>
        getTestPlanVersionTitle(keyValue[1])
    );

    const tabularReports = {};
    const tabularReportsByDirectory = {};
    Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
        const directory =
            testPlanVersionsById[testPlanVersionId].testPlan.directory;

        tabularReports[testPlanVersionId] = {};
        if (!tabularReportsByDirectory[directory])
            tabularReportsByDirectory[directory] = {};
        tabularReportsByDirectory[directory][testPlanVersionId] = {};
        Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
            tabularReports[testPlanVersionId][testPlanTargetId] = null;
            tabularReportsByDirectory[directory][testPlanVersionId][
                testPlanTargetId
            ] = null;
        });
    });

    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;
        const directory = testPlanVersion.testPlan.directory;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        tabularReports[testPlanVersion.id][testPlanTarget.id] = testPlanReport;
        tabularReportsByDirectory[directory][testPlanVersion.id][
            testPlanTarget.id
        ] = testPlanReport;
        tabularReportsByDirectory[directory][
            testPlanVersion.id
        ].testPlanVersion = testPlanVersion;
    });

    testPlans.forEach(testPlan => {
        if (!(testPlan.directory in tabularReportsByDirectory)) {
            tabularReportsByDirectory[testPlan.directory] = testPlan;
        }
    });

    const combineObject = originalObject => {
        let combinedTestPlanVersionIdArray = [];
        let resultTestPlanTargets = Object.values(originalObject)[0];
        combinedTestPlanVersionIdArray.push(
            resultTestPlanTargets.testPlanVersion.id
        );

        for (let i = 1; i < Object.values(originalObject).length; i++) {
            let testPlanTargets = Object.values(originalObject)[i];
            if (
                !combinedTestPlanVersionIdArray.includes(
                    testPlanTargets.testPlanVersion.id
                )
            )
                combinedTestPlanVersionIdArray.push(
                    testPlanTargets.testPlanVersion.id
                );

            delete testPlanTargets.testPlanVersion;

            // Check if exists in newObject and add/update newObject based on criteria
            Object.keys(testPlanTargets).forEach(testPlanTargetKey => {
                if (!resultTestPlanTargets[testPlanTargetKey])
                    resultTestPlanTargets[testPlanTargetKey] =
                        testPlanTargets[testPlanTargetKey];
                else {
                    const latestPrevDate = new Date(
                        testPlanTargets[
                            testPlanTargetKey
                        ]?.latestAtVersionReleasedAt?.releasedAt
                    );

                    const latestCurrDate = new Date(
                        resultTestPlanTargets[
                            testPlanTargetKey
                        ]?.latestAtVersionReleasedAt?.releasedAt
                    );

                    if (latestPrevDate >= latestCurrDate)
                        resultTestPlanTargets[testPlanTargetKey] =
                            testPlanTargets[testPlanTargetKey];
                }
            });
        }
        return { resultTestPlanTargets, combinedTestPlanVersionIdArray };
    };

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
                Manage test plans in the Test Queue (which are using the latest
                Assistive Technology versions), and their test plan phases.
            </p>

            <ManageTestQueue
                ats={ats}
                browsers={browsers}
                testPlanVersions={testPlanVersions}
                triggerUpdate={refetch}
            />

            <br />
            <br />
            <>
                <Table
                    className="data-management"
                    aria-label="Unsure right now"
                    hover
                    striped
                    bordered
                >
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            <th>Covered AT</th>
                            <th>Overall Status</th>
                            <th>R&D Version</th>
                            <th>Draft Review</th>
                            <th>Candidate Review</th>
                            <th>Recommended Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testPlans
                            .slice()
                            .sort((a, b) => (a.title < b.title ? -1 : 1))
                            .map(testPlan => {
                                return (
                                    <DataManagementRow
                                        key={testPlan.id}
                                        testPlan={testPlan}
                                        testPlanVersions={testPlanVersions.filter(
                                            testPlanVersion =>
                                                testPlanVersion.testPlan
                                                    .directory ===
                                                testPlan.directory
                                        )}
                                        testPlanReports={testPlanReports.filter(
                                            testPlanReport =>
                                                testPlanReport.testPlanVersion
                                                    .testPlan.directory ===
                                                testPlan.directory
                                        )}
                                        activePhasesByTestPlan={
                                            activePhasesByTestPlan
                                        }
                                    />
                                );
                            })}
                    </tbody>
                </Table>
            </>

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
                                    <th className="phase">Phase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Sort the summary items by title */}
                                {Object.values(tabularReportsByDirectory)
                                    .sort((a, b) => {
                                        return (
                                            a.title ||
                                            Object.values(a)[0].testPlanVersion
                                                .title
                                        ).localeCompare(
                                            b.title ||
                                                Object.values(b)[0]
                                                    .testPlanVersion.title
                                        );
                                    })
                                    .map(tabularReport => {
                                        let reportResult = null;
                                        let testPlanVersionId = null;

                                        // Evaluate what is prioritised across the
                                        // collection of testPlanVersions
                                        if (
                                            typeof Object.values(
                                                tabularReport
                                            )[0] !== 'object'
                                        ) {
                                            return (
                                                <StatusSummaryRow
                                                    key={
                                                        tabularReport
                                                            .latestTestPlanVersion
                                                            ?.id
                                                    }
                                                    testPlanVersion={
                                                        tabularReport.latestTestPlanVersion
                                                    }
                                                    reportResult={{}}
                                                />
                                            );
                                        } else if (
                                            Object.values(tabularReport)
                                                .length > 1
                                        ) {
                                            const {
                                                resultTestPlanTargets,
                                                combinedTestPlanVersionIdArray
                                            } = combineObject(tabularReport);
                                            reportResult =
                                                resultTestPlanTargets;
                                            testPlanVersionId =
                                                combinedTestPlanVersionIdArray.join(
                                                    ','
                                                );
                                        } else {
                                            reportResult =
                                                Object.values(tabularReport)[0];
                                            testPlanVersionId =
                                                reportResult.testPlanVersion.id;
                                        }

                                        const testPlanVersion =
                                            reportResult.testPlanVersion;
                                        delete reportResult.testPlanVersion;

                                        return (
                                            <StatusSummaryRow
                                                key={testPlanVersionId}
                                                testPlanVersion={
                                                    testPlanVersion
                                                }
                                                reportResult={reportResult}
                                            />
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
