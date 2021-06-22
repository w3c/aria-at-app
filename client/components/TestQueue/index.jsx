import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Container, Table, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getAllUsers } from '../../actions/users';
import { getActiveRuns, getActiveRunConfiguration } from '../../actions/runs';
import { handleGetValidAts } from '../../actions/ats';
import nextId from 'react-id-generator';
import TestQueueRun from '../TestQueueRun';
import DeleteResultsModal from '../DeleteResultsModal';
import CurrentGitCommit from '../CurrentGitCommit';
import './TestQueue.css';

const TEST_PLAN_REPORTS_QUERY = gql`
    query {
        me {
            id
            username
            roles
        }
        users {
            id
            username
            roles
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
            id
            status
            # conflictCount
            testPlanTarget {
                id
                title
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                atVersion
                browserVersion
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testCount
            }
            draftTestPlanRuns {
                id
                tester {
                    id
                    username
                }
                testResultCount
            }
        }
    }
`;

const TestQueue = () => {
    // eslint-disable-next-line no-unused-vars
    const { loading, error, data } = useQuery(TEST_PLAN_REPORTS_QUERY);

    const [user, setUser] = useState({});
    const [testers, setTesters] = useState([]);
    const [testPlanReports, setTestPlanReports] = useState([]);
    const [structuredTestPlanTargets, setStructuredTestPlanTargets] = useState(
        {}
    );

    useEffect(() => {
        if (data) {
            const { me = {}, users = [], testPlanReports = [] } = data;
            setUser(me);
            setTesters(users);
            // setTestPlanReports(testPlanReports);
            setTestPlanReports([
                {
                    id: '1',
                    status: 'DRAFT',
                    conflictCount: 0,
                    testPlanTarget: {
                        id: '1',
                        title: 'NVDA 2020.4 with Chrome 91.0.4472'
                    },
                    testPlanVersion: {
                        id: '1',
                        title: 'Checkbox Example (Two State)',
                        gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                        gitMessage:
                            'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                        testCount: 26,
                        directory: 'checkbox'
                    },
                    draftTestPlanRuns: [
                        {
                            id: '1',
                            tester: {
                                username: 'howard-e'
                            },
                            testResultCount: 2
                        }
                    ]
                },
                {
                    id: '2',
                    status: 'DRAFT',
                    conflictCount: 0,
                    testPlanTarget: {
                        id: '2',
                        title: 'NVDA 2020.4 with Chrome 91.0.4472'
                    },
                    testPlanVersion: {
                        id: '2',
                        title: 'Checkbox Example (Three State)',
                        gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                        gitMessage:
                            'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                        testCount: 26,
                        directory: 'checkbox'
                    },
                    draftTestPlanRuns: [
                        {
                            id: '2',
                            tester: {
                                username: 'somebody-else'
                            },
                            testResultCount: 2
                        }
                    ]
                },
                {
                    id: '3',
                    status: 'DRAFT',
                    conflictCount: 0,
                    testPlanTarget: {
                        id: '3',
                        title: 'JAWS 2020.4 with Firefox 89.02'
                    },
                    testPlanVersion: {
                        id: '2',
                        title: 'Checkbox Example (Five State)',
                        gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                        gitMessage:
                            'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                        testCount: 26,
                        directory: 'checkbox-complete'
                    },
                    draftTestPlanRuns: [
                        {
                            id: '3',
                            tester: {
                                username: 'howard-e'
                            },
                            testResultCount: 2
                        },
                        {
                            id: '4',
                            tester: {
                                username: 'somebody-else'
                            },
                            testResultCount: 2
                        }
                    ]
                },
                {
                    id: '4',
                    status: 'DRAFT',
                    conflictCount: 0,
                    testPlanTarget: {
                        id: '4',
                        title: 'NVDA 2020.4 with Chrome 91.0.4472'
                    },
                    testPlanVersion: {
                        id: '4',
                        title: 'Checkbox Example (Two State)',
                        gitSha: '5498v98dfv2492042092409204924',
                        gitMessage:
                            'Other Revert "Generated tests and review pages output improvements (#441)" (#449)',
                        testCount: 26,
                        directory: 'checkbox'
                    },
                    draftTestPlanRuns: [
                        {
                            id: '5',
                            tester: {
                                username: 'howard-e'
                            },
                            testResultCount: 1
                        }
                    ]
                },
                {
                    id: '5',
                    status: 'DRAFT',
                    conflictCount: 0,
                    testPlanTarget: {
                        id: '5',
                        title: 'NVDA 2020.4 with Chrome 91.0.4472'
                    },
                    testPlanVersion: {
                        id: '5',
                        title: 'Editor Menubar Example',
                        gitSha: '4ca7842ea7777b668546e74c9b5ed5b09696d927',
                        gitMessage:
                            'Revert "Generated tests and review pages output improvements (#441)" (#449)',
                        testCount: 20,
                        directory: 'something-else'
                    },
                    draftTestPlanRuns: []
                }
            ]);
        }
    }, [data]);

    useEffect(() => {
        const structuredTestPlanTargets = generateStructuredTestPlanVersions(
            testPlanReports
        );
        setStructuredTestPlanTargets(structuredTestPlanTargets);
    }, [testPlanReports]);

    // TODO: this should probably be part of a resolver instead
    const generateStructuredTestPlanVersions = testPlanReports => {
        const structuredData = {};

        // get all testPlanTargets grouped to make it easier to drop into TestQueue table
        testPlanReports.forEach(testPlanReport => {
            if (!structuredData[testPlanReport.testPlanTarget.title]) {
                structuredData[testPlanReport.testPlanTarget.title] = [
                    testPlanReport
                ];
            } else {
                structuredData[testPlanReport.testPlanTarget.title].push(
                    testPlanReport
                );
            }
        });

        return structuredData;
    };

    const renderAtBrowserList = (title = '', testPlanReports = []) => {
        // means structuredTestPlanTargets would have been generated
        if (testPlanReports.length) {
            const tableId = nextId('table_name_');

            return (
                <div key={title}>
                    <h2 id={tableId}>{title}</h2>
                    <Table
                        className="test-queue"
                        aria-labelledby={tableId}
                        striped
                        bordered
                        hover
                    >
                        <thead>
                            <tr>
                                <th className="test-plan">Test Plan</th>
                                <th className="testers">Testers</th>
                                <th className="report-status">Report Status</th>
                                <th className="actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* TODO: Iterate over collection of TestPlanReport/Versions? */}
                            {testPlanReports.map(testPlanReport => {
                                const id = nextId('test_queue_run_');
                                return (
                                    <TestQueueRun
                                        key={id}
                                        user={user}
                                        testers={testers}
                                        testPlanReport={testPlanReport}
                                        handleAssignTester={null}
                                        handleRemoveTester={null}
                                    />
                                );
                            })}

                            {/*{runIds.map(runId => {*/}
                            {/*    return (*/}
                            {/*        <TestQueueRun*/}
                            {/*            key={runId}*/}
                            {/*            runId={runId}*/}
                            {/*            atName={atName}*/}
                            {/*            browserName={browserName}*/}
                            {/*            // TODO: Shouldn't be hardcoded*/}
                            {/*            admin={true}*/}
                            {/*            deleteResults={this.deleteResults}*/}
                            {/*            showDeleteResultsModal={*/}
                            {/*                this.showDeleteResultsModal*/}
                            {/*            }*/}
                            {/*        />*/}
                            {/*    );*/}
                            {/*})}*/}
                        </tbody>
                    </Table>
                </div>
            );
        }
        return null;
    };

    const loadingView = <div data-test="test-queue-loading">Loading</div>;

    return loading ? (
        loadingView
    ) : (
        <Container as="main">
            <Helmet>
                <title>{`Test Queue | ARIA-AT`}</title>
            </Helmet>
            <h1>Test Queue</h1>
            <p>
                Assign yourself a test plan or start executing one that is
                already assigned to you.
            </p>
            {/* TODO: Remove */}
            <CurrentGitCommit
                label="Current Git Commit"
                // TODO: Shouldn't be hardcoded
                gitHash={
                    testPlanReports[0] &&
                    testPlanReports[0].testPlanVersion.gitSha
                }
                gitCommitMessage={
                    testPlanReports[0] &&
                    testPlanReports[0].testPlanVersion.gitMessage
                }
            />
            {Object.keys(structuredTestPlanTargets).map(key =>
                renderAtBrowserList(key, structuredTestPlanTargets[key])
            )}
        </Container>
    );
};

export default TestQueue;
