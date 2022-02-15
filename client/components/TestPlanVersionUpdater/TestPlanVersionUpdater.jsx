import React from 'react';
import { Container } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import { UPDATER_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import { gitUpdatedDateToString } from '../../utils/gitUtils';

const TestPlanVersionUpdater = () => {
    const { loading, data: updaterData } = useQuery(UPDATER_QUERY);

    if (loading) {
        return (
            <PageStatus
                title="Loading - Version Updater | ARIA-AT"
                heading="Test Plan Version Updater"
            />
        );
    }

    const {
        testPlanReport: {
            testPlanTarget: {
                at: { name: atName },
                atVersion,
                browser: { name: browserName },
                browserVersion
            },
            testPlanVersion: { title }
        },
        testPlan: { testPlanVersions }
    } = updaterData;

    return (
        <Container id="main" as="main" tabIndex="-1">
            <h1>Test Plan Version Updater</h1>
            <p>
                This tool updates the version of the test plan associated with a
                report.
            </p>
            <h2>Selected Report</h2>
            <p>
                {`${atName} ${atVersion} with ${browserName} ${browserVersion} ${title}`}
            </p>
            <h2>Pick a Version</h2>
            <p>Current version is from Nov 18, 2021 at 11:38:39 pm UTC</p>
            <select>
                {(() =>
                    testPlanVersions.map(testPlanVersion => (
                        <option key={testPlanVersion.id}>
                            {gitUpdatedDateToString(testPlanVersion.updatedAt)}{' '}
                            {testPlanVersion.gitMessage} (
                            {testPlanVersion.gitSha.substring(0, 7)})
                        </option>
                    )))()}
            </select>
            <h2>Create the New Report</h2>
            <p>1 test result will be deleted. 33 tests will be copied.</p>
            <button>Create updated report</button>
            <h2>Delete the Old Report</h2>
            <button>Delete old report</button>
        </Container>
    );
};

export default TestPlanVersionUpdater;
