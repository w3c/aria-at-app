const axios = require('axios');
const {
    getCollectionJobById,
    updateCollectionJob,
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
const { HttpQueryError } = require('apollo-server-core');
const { COLLECTION_JOB_STATUS } = require('../util/enums');

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 1000
};

const throwNoJobFoundError = jobId => {
    throw new HttpQueryError(
        404,
        `Could not find job with jobId: ${jobId}`,
        true
    );
};

const throwSchedulerError = schedulerResponse => {
    throw new HttpQueryError(
        502,
        `Response scheduler did not give a correct response: ${schedulerResponse}`,
        false
    );
};

const cancelJob = async (req, res) => {
    const automationSchedulerResponse = await axios.post(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/cancel`,
        {},
        axiosConfig
    );

    if (!automationSchedulerResponse.data) {
        throwSchedulerError(automationSchedulerResponse);
    }

    if (
        automationSchedulerResponse.data.status ===
        COLLECTION_JOB_STATUS.CANCELLED
    ) {
        const graphqlRes = await updateCollectionJob(req.params.jobID, {
            status: COLLECTION_JOB_STATUS.CANCELLED
        });
        if (!graphqlRes) {
            throwNoJobFoundError(req.params.jobID);
        }
    }
    res.json(automationSchedulerResponse.data);
};

const getJobLog = async (req, res) => {
    const automationSchedulerResponse = await axios.get(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/log`,
        axiosConfig
    );
    if (!automationSchedulerResponse.data) {
        throwSchedulerError(automationSchedulerResponse);
    }
    res.json(automationSchedulerResponse.data);
};

const updateJobStatus = async (req, res) => {
    const { status } = req.body;

    if (!Object.values(COLLECTION_JOB_STATUS).includes(status)) {
        throw new HttpQueryError(400, `Invalid status: ${status}`, true);
    }

    const graphqlResponse = await updateCollectionJob(req.params.jobID, {
        status
    });

    if (!graphqlResponse) {
        throwNoJobFoundError(req.params.jobID);
    }

    res.json(graphqlResponse);
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
    const id = req.params.jobID;
    const { testId, responses, atVersionName, browserVersionName } = req.body;
    const job = await getCollectionJobById(id);

    if (!job) {
        throwNoJobFoundError(id);
    }

    if (job.status !== COLLECTION_JOB_STATUS.RUNNING) {
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
};

const deleteJob = async (req, res) => {
    const graphqlResponse = await deleteCollectionJob(req.params.jobID);
    res.json(graphqlResponse);
};

module.exports = {
    cancelJob,
    getJobLog,
    updateJobStatus,
    updateJobResults,
    deleteJob
};
