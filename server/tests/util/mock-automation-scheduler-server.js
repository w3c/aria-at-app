const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');
const express = require('express');
const {
    verifyAutomationScheduler
} = require('../../middleware/verifyAutomationScheduler');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { default: axios } = require('axios');
const { gql } = require('apollo-server-core');
const { query } = require('../util/graphql-test-utilities');

const setupMockAutomationSchedulerServer = async () => {
    const app = express();
    app.use(express.json());
    app.use(verifyAutomationScheduler);

    let shutdownManager;
    await new Promise(resolve => {
        const listener = app.listen(
            process.env.AUTOMATION_SCHEDULER_PORT,
            resolve
        );
        shutdownManager = new GracefulShutdownManager(listener);
    });

    const generateRandomId = () => {
        return Math.floor(Math.random() * 1000000).toString();
    };

    const simulateJobStatusUpdate = async (jobId, newStatus) => {
        await axios.post(
            `${process.env.APP_SERVER}/api/jobs/${jobId}/update`,
            {
                status: newStatus
            },
            {
                headers: {
                    'x-automation-secret':
                        process.env.AUTOMATION_SCHEDULER_SECRET
                },
                timeout: 1000
            }
        );
    };

    const simulateResultCompletion = async (
        tests,
        atVersionName,
        browserVersionName,
        jobId,
        currentTestIndex
    ) => {
        const currentTest = tests[currentTestIndex];
        const { id, scenarios, assertions } = currentTest;

        const responses = [];
        scenarios.forEach(() => {
            assertions.forEach(() => {
                responses.push('Local development simulated output');
            });
        });
        const testResult = {
            testId: id,
            atVersionName,
            browserVersionName,
            responses
        };
        await axios.post(
            `${process.env.APP_SERVER}/api/jobs/${jobId}/result`,
            testResult,
            {
                headers: {
                    'x-automation-secret':
                        process.env.AUTOMATION_SCHEDULER_SECRET
                },
                timeout: 1000
            }
        );

        if (currentTestIndex < tests.length - 1) {
            setTimeout(() => {
                simulateResultCompletion(
                    tests,
                    atVersionName,
                    browserVersionName,
                    jobId,
                    currentTestIndex + 1
                );
            }, Math.random() * 1000);
        } else {
            setTimeout(
                () =>
                    simulateJobStatusUpdate(
                        jobId,
                        COLLECTION_JOB_STATUS.COMPLETED
                    ),
                1000
            );
        }

        return testResult;
    };

    app.post('/jobs/new', async (req, res) => {
        if (process.env.ENVIRONMENT === 'test') {
            return res.json({
                id: '999',
                status: COLLECTION_JOB_STATUS.QUEUED
            });
        } else {
            // Local development must simulate posting results
            const { testPlanVersionGitSha, testPlanName } = req.body;

            const { testPlanVersions } = await query(gql`
                query {
                    testPlanVersions {
                        id
                        gitSha
                        testPlan {
                            id
                        }
                        testPlanReports {
                            at {
                                name
                                atVersions {
                                    name
                                }
                            }
                            browser {
                                name
                                browserVersions {
                                    name
                                }
                            }
                            runnableTests {
                                id
                                scenarios {
                                    id
                                }
                                assertions {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const testPlanVersion = testPlanVersions.find(
                testPlanVersion =>
                    testPlanVersion.gitSha === testPlanVersionGitSha &&
                    testPlanVersion.testPlan.id === testPlanName
            );

            const testPlanReport = testPlanVersion.testPlanReports.find(
                testPlanReport =>
                    testPlanReport.at.name === 'NVDA' &&
                    testPlanReport.browser.name === 'Chrome'
            );

            const browserVersionName =
                testPlanReport.browser.browserVersions[0].name;

            const atVersionName = testPlanReport.at.atVersions[0].name;
            const { runnableTests } = testPlanReport;
            const jobId = generateRandomId();

            setTimeout(
                () =>
                    simulateJobStatusUpdate(
                        jobId,
                        COLLECTION_JOB_STATUS.RUNNING
                    ),
                1000
            );

            setTimeout(
                () =>
                    simulateResultCompletion(
                        runnableTests,
                        atVersionName,
                        browserVersionName,
                        jobId,
                        0
                    ),
                3000
            );
            return res.json({
                id: jobId,
                status: COLLECTION_JOB_STATUS.QUEUED
            });
        }
    });

    app.post('/jobs/:jobID/cancel', (req, res) => {
        return res.json({
            id: req.params.jobID,
            status: COLLECTION_JOB_STATUS.CANCELLED
        });
    });

    app.post('/jobs/:jobID/restart', (req, res) => {
        return res.json({
            id: req.params.jobID,
            status: COLLECTION_JOB_STATUS.QUEUED
        });
    });

    app.get('/jobs/:jobID/log', (req, res) => {
        return res.json({ id: req.params.jobID, log: 'TEST LOG' });
    });

    const tearDown = async () => {
        await new Promise(resolve => {
            shutdownManager.terminate(resolve);
        });
    };

    return {
        tearDown
    };
};

module.exports = setupMockAutomationSchedulerServer;
