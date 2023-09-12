const axios = require('axios');
const {
    getCollectionJobById,
    updateCollectionJob,
    getOrCreateCollectionJob,
    deleteCollectionJob
} = require('../models/services/CollectionJobService');
const {
    findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const { getAtVersions } = require('../models/services/AtService');
const { getBrowserVersions } = require('../models/services/BrowserService');
const { getTestPlanRuns } = require('../models/services/TestPlanRunService');
const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');
const { runnableTests } = require('../resolvers/TestPlanReport');

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 1000
};

const scheduleNewJob = async (req, res) => {
    try {
        const { testPlanReportId } = req.body;

        const report = await getTestPlanReportById(testPlanReportId);

        if (!report) {
            throw new Error(
                `Test plan report with id ${testPlanReportId} not found`
            );
        }

        const tests = await runnableTests(report);
        const { directory } = report.testPlanVersion.testPlan;
        const { gitSha } = report.testPlanVersion;

        if (!tests || tests.length === 0) {
            throw new Error(
                `No runnable tests found for test plan report with id ${testPlanReportId}`
            );
        }

        if (!gitSha) {
            throw new Error(
                `Test plan version with id ${report.testPlanVersionId} does not have a gitSha`
            );
        }

        if (!directory) {
            throw new Error(
                `Test plan with id ${report.testPlanVersion.testPlanId} does not have a directory`
            );
        }

        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
            {
                testPlanVersionGitSha: gitSha,
                testIds: tests.map(t => t.id),
                testPlanName: directory
            },
            axiosConfig
        );

        const { id, status } = automationSchedulerResponse.data;
        if (id) {
            const job = await getOrCreateCollectionJob({
                id,
                status,
                testPlanReportId
            });
            res.json(job);
        } else {
            throw new Error('Job not created');
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const cancelJob = async (req, res) => {
    try {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/cancel`,
            {},
            axiosConfig
        );
        if (automationSchedulerResponse.data.status === 'CANCELED') {
            await updateCollectionJob(req.params.jobID, {
                status: 'CANCELED'
            });
        } else {
            throw new Error('Job not canceled');
        }
        res.json(automationSchedulerResponse.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const restartJob = async (req, res) => {
    try {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/restart`,
            {},
            axiosConfig
        );
        if (automationSchedulerResponse.data.status === 'QUEUED') {
            await updateCollectionJob(req.params.jobID, {
                status: 'QUEUED'
            });
        } else {
            throw new Error('Job not restarted');
        }
        res.json(automationSchedulerResponse.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobLog = async (req, res) => {
    try {
        const automationSchedulerResponse = await axios.get(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/log`,
            axiosConfig
        );
        res.json(automationSchedulerResponse.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const graphqlResponse = await updateCollectionJob(req.params.jobID, {
            status
        });

        res.json(graphqlResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getApprovedTestPlanRuns = async testPlanRun => {
    const { testPlanReport } = testPlanRun;
    const { testPlanVersion } = testPlanReport;

    // To be considered "Approved", a test plan run must be associated with a test plan report
    // that is associated with a test plan version that is in "CANDIDATE" or "RECOMMENDED" or
    // "DRAFT" phase and has been marked as final.
    if (
        !testPlanVersion ||
        testPlanVersion.phase === 'RD' ||
        (testPlanVersion.phase === 'DRAFT' && !testPlanReport.markedFinalAt)
    )
        return null;

    return getTestPlanRuns(null, {
        testPlanReportId: testPlanReport.id
    });
};

const getMostRecentHistoricalTestResults = async testPlanRun => {
    const approvedTestPlanRunsWithSameReport = await getApprovedTestPlanRuns(
        testPlanRun
    );

    if (
        !approvedTestPlanRunsWithSameReport ||
        approvedTestPlanRunsWithSameReport.length === 0
    ) {
        return null;
    }
    // It will be rare that we have multiple historic test plan runs, but if we do,
    // we want to use the most recent one. This is determined with the completion date of
    // last test result in the test plan run.
    const mostRecentApprovedTestPlanRun =
        approvedTestPlanRunsWithSameReport?.reduce((acc, curr) => {
            const accDate =
                acc?.testResults?.[acc.testResults.length - 1]?.completedAt;
            const currDate =
                curr?.testResults?.[curr.testResults.length - 1]?.completedAt;
            return currDate > accDate ? curr : acc;
        });

    return mostRecentApprovedTestPlanRun.testResults;
};

const updateOrCreateTestResultWithResponses = async ({
    testId,
    testPlanRun,
    responses,
    atVersionId,
    browserVersionId
}) => {
    const { testResult } = await findOrCreateTestResult({
        testId,
        testPlanRunId: testPlanRun.id,
        atVersionId,
        browserVersionId
    });

    const historicalTestResults = await getMostRecentHistoricalTestResults(
        testPlanRun
    );

    const historicalTestResult = historicalTestResults?.find(each => {
        return each.testId === testId;
    });

    if (
        historicalTestResult &&
        historicalTestResult.scenarioResults?.length !==
            testResult.scenarioResults.length
    ) {
        throw new Error(
            'Historical test result does not match current test result'
        );
    }

    const getAutomatedResultFromOutput = ({ baseTestResult, outputs }) => ({
        ...baseTestResult,
        atVersionId,
        browserVersionId,
        scenarioResults: baseTestResult.scenarioResults.map(
            (scenarioResult, i) => ({
                ...scenarioResult,
                output: outputs[i],
                assertionResults: scenarioResult.assertionResults.map(
                    (assertionResult, j) => ({
                        ...assertionResult,
                        passed: historicalTestResult
                            ? historicalTestResult.scenarioResults[i]
                                  .assertionResults[j].passed
                            : false,
                        failedReason: historicalTestResult
                            ? historicalTestResult.scenarioResults[i]
                                  .assertionResults[j].failedReason
                            : 'AUTOMATED_OUTPUT'
                    })
                ),
                unexpectedBehaviors: []
            })
        )
    });

    return saveTestResultCommon({
        testResultId: testResult.id,
        input: convertTestResultToInput(
            getAutomatedResultFromOutput({
                baseTestResult: testResult,
                outputs: responses
            })
        ),
        isSubmit: true
    });
};

const updateJobResults = async (req, res) => {
    try {
        const id = req.params.jobID;
        const { testId, responses, atVersionName, browserVersionName } =
            req.body;
        const job = await getCollectionJobById(id);

        if (!job) {
            throw new Error(`Job with id ${id} not found`);
        }

        if (job.status !== 'RUNNING') {
            throw new Error(
                `Job with id ${id} is not running, cannot update results`
            );
        }

        const [atVersions, browserVersions] = await Promise.all([
            getAtVersions(),
            getBrowserVersions()
        ]);
        const atVersion = atVersions.find(each => each.name === atVersionName);
        const browserVersion = browserVersions.find(
            each => each.name === browserVersionName
        );

        if (!atVersion) throw new Error('AT version not found');
        if (!browserVersion) throw new Error('Browser version not found');

        await updateOrCreateTestResultWithResponses({
            testId,
            responses,
            testPlanRun: job.testPlanRun,
            atVersionId: atVersion.id,
            browserVersionId: browserVersion.id
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const graphqlResponse = await deleteCollectionJob(req.params.jobID);
        res.json(graphqlResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    scheduleNewJob,
    cancelJob,
    restartJob,
    getJobLog,
    updateJobStatus,
    updateJobResults,
    deleteJob
};
