import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useApolloClient } from '@apollo/client';
import { TEST_PLAN_ID_QUERY, UPDATER_QUERY, VERSION_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import { gitUpdatedDateToString } from '../../utils/gitUtils';
import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

const Select = styled.select`
    max-width: 300px;
`;

const TestPlanVersionUpdater = () => {
    const loadInitialData = async ({ client, setUpdaterData, location }) => {
        const testPlanReportId = location.search.match(/\?id=(\d+)/)?.[1];
        if (!testPlanReportId) throw new Error('No id found in URL');

        const { data: testPlanIdData } = await client.query({
            query: TEST_PLAN_ID_QUERY,
            variables: { testPlanReportId }
        });
        const testPlanId =
            testPlanIdData?.testPlanReport?.testPlanVersion?.testPlan?.id;

        if (!testPlanId)
            throw new Error(
                `Could not find test plan report with id "${testPlanReportId}"`
            );

        const { data: updaterData } = await client.query({
            query: UPDATER_QUERY,
            variables: { testPlanReportId, testPlanId }
        });
        setUpdaterData(updaterData);
    };

    const client = useApolloClient();
    const [updaterData, setUpdaterData] = useState();
    const [versionData, setVersionData] = useState();
    const location = useLocation();

    useEffect(() => {
        loadInitialData({ client, setUpdaterData, location });
    }, []);

    if (!updaterData) {
        return (
            <PageStatus
                title="Loading - Version Updater | ARIA-AT"
                heading="Test Plan Version Updater"
            />
        );
    }

    const {
        testPlanReport: {
            id: testPlanReportId,
            testPlanTarget: {
                at: { name: atName },
                atVersion,
                browser: { name: browserName },
                browserVersion
            },
            testPlanVersion: currentVersion
        },
        testPlan: { testPlanVersions }
    } = updaterData;

    const selectVersion = async event => {
        const testPlanVersionId = event.target.value;
        if (testPlanVersionId === 'unselected') {
            setVersionData(null);
            return;
        }

        const { data: versionData } = await client.query({
            query: VERSION_QUERY,
            variables: {
                testPlanReportId,
                testPlanVersionId: event.target.value
            }
        });
        setVersionData(versionData);
    };

    return (
        <Container id="main" as="main" tabIndex="-1">
            <h1>Test Plan Version Updater</h1>
            <p>
                {/* TODO: improve explanation */}
                This tool updates the version of the test plan associated with a
                report.
            </p>
            <h2>Selected Report</h2>
            <p>
                {atName} {atVersion} with {browserName} {browserVersion}{' '}
                {currentVersion.title}
            </p>
            <h2>Pick a Version</h2>
            <p>
                Current version is from{' '}
                {gitUpdatedDateToString(currentVersion.updatedAt)}.
            </p>
            <Select defaultValue="unselected" onChange={selectVersion}>
                <option value="unselected">Please choose a new version</option>
                {(() =>
                    testPlanVersions.map(testPlanVersion => (
                        <option
                            key={testPlanVersion.id}
                            disabled={currentVersion.id === testPlanVersion.id}
                            value={testPlanVersion.id}
                        >
                            {currentVersion.id === testPlanVersion.id
                                ? '[Current Version] '
                                : ''}
                            {gitUpdatedDateToString(testPlanVersion.updatedAt)}{' '}
                            {testPlanVersion.gitMessage} (
                            {testPlanVersion.gitSha.substring(0, 7)})
                        </option>
                    )))()}
            </Select>
            <h2>Create the New Report</h2>
            <p>1 test result will be deleted. 33 tests will be copied.</p>
            <button>Create updated report</button>
            <h2>Delete the Old Report</h2>
            <button>Delete old report</button>
        </Container>
    );
};

export default TestPlanVersionUpdater;
