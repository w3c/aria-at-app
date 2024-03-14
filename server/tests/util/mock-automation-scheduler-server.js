const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');
const express = require('express');
const {
    verifyAutomationScheduler
} = require('../../middleware/verifyAutomationScheduler');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { default: axios } = require('axios');
const { gql } = require('apollo-server-core');
const apolloServer = require('../../graphql-server');
const { axiosConfig } = require('../../controllers/AutomationController');

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

    const simulateJobStatusUpdate = async (jobId, newStatus) => {
        await axios.post(
            `${process.env.APP_SERVER}/api/jobs/${jobId}/update`,
            {
                status: newStatus
            },
            axiosConfig
        );
    };

    const simulateResultCompletion = async (
        tests,
        atVersionName,
        browserVersionName,
        jobId,
        currentTestIndex,
        isV2
    ) => {
        const currentTest = tests[currentTestIndex];
        const { scenarios, assertions } = currentTest;

        const responses = [];
        scenarios.forEach(() => {
            assertions.forEach(() => {
                responses.push('Local development simulated output');
            });
        });

        const testResult = {
            atVersionName,
            browserVersionName,
            responses
        };

        testResult[isV2 ? 'presentationNumber' : 'testCsvRow'] =
            currentTest.rowNumber;
        try {
            await axios.post(
                `${process.env.APP_SERVER}/api/jobs/${jobId}/result`,
                testResult,
                axiosConfig
            );
        } catch (e) {
            // Likely just means the test was cancelled
            return;
        }

        if (currentTestIndex < tests.length - 1) {
            setTimeout(() => {
                simulateResultCompletion(
                    tests,
                    atVersionName,
                    browserVersionName,
                    jobId,
                    currentTestIndex + 1,
                    isV2
                );
            }, Math.random() * 5000);
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
                status: COLLECTION_JOB_STATUS.QUEUED
            });
        } else {
            // Local development must simulate posting results
            const { testPlanVersionGitSha, testPlanName, jobId } = req.body;

            const {
                data: { testPlanVersions }
            } = await apolloServer.executeOperation({
                query: gql`
                    query {
                        testPlanVersions {
                            id
                            gitSha
                            metadata
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
                                    rowNumber
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
                `
            });

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

            const isV2 = testPlanVersion.metadata?.testFormatVersion === 2;

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
                        0,
                        isV2
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
