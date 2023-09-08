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

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 1000
};

const scheduleNewJob = async (req, res) => {
    try {
        const { testPlanReportId } = req.body;
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
            { testPlanReportId },
            axiosConfig
        );
        const { id, status } = automationSchedulerResponse.data;

        if (id) {
            await getOrCreateCollectionJob({
                id,
                status,
                testPlanReportId
            });
        }

        res.json(automationSchedulerResponse.data);
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
    if (
        !testPlanVersion ||
        testPlanVersion.phase === 'RD' ||
        (testPlanVersion.phase === 'DRAFT' && !testPlanReport.markedFinalAt)
    )
        return null;

    const testPlanRunsFromReport = await getTestPlanRuns(null, {
        testPlanReportId: testPlanReport.id
    });

    const approvedTestPlanRuns = testPlanRunsFromReport.filter(
        each => each.testPlanReport.testPlanVersionId === testPlanVersion.id
    );

    if (!approvedTestPlanRuns || approvedTestPlanRuns.length === 0) return null;

    return approvedTestPlanRuns;
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

    const { testResults: mostRecentHistoricalTestResults } =
        mostRecentApprovedTestPlanRun;

    return mostRecentHistoricalTestResults;
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

    let savedData = await saveTestResultCommon({
        testResultId: testResult.id,
        input: convertTestResultToInput(
            getAutomatedResultFromOutput({
                baseTestResult: testResult,
                outputs: responses
            })
        ),
        isSubmit: true
    });

    return savedData;
};

const updateJobResults = async (req, res) => {
    try {
        const id = req.params.jobID;
        const { testId, responses, atVersionName, browserVersionName } =
            req.body;
        const job = await getCollectionJobById(id);

        if (!job) throw new Error(`Job with id ${id} not found`);
        if (job.status !== 'RUNNING')
            throw new Error(
                `Job with id ${id} is not running, cannot update results`
            );

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
