const axios = require('axios');
const {
    getCollectionJobById,
    updateCollectionJob
} = require('../models/services/CollectionJobService');
const {
    findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const { getAtVersions } = require('../models/services/AtService');
const { getBrowserVersions } = require('../models/services/BrowserService');
const { HttpQueryError } = require('apollo-server-core');
const { COLLECTION_JOB_STATUS } = require('../util/enums');
const populateData = require('../services/PopulatedData/populateData');
const {
    getFinalizedTestResults
} = require('../models/services/TestResultReadService');

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

const getApprovedFinalizedTestResults = async testPlanRun => {
    const {
        testPlanReport: { testPlanVersion }
    } = testPlanRun;

    // To be considered "Approved", a test plan run must be associated with a test plan report
    // that is associated with a test plan version that is in "CANDIDATE" or "RECOMMENDED" or
    // "DRAFT" phase and the test plan report been marked as final.
    const { phase } = testPlanVersion;

    if (
        phase === 'RD' ||
        (phase === 'DRAFT' && testPlanRun.testPlanReport.markedFinalAt === null)
    ) {
        return null;
    }

    const { testPlanReport } = await populateData({
        testPlanReportId: testPlanRun.testPlanReport.id
    });

    return await getFinalizedTestResults({
        ...testPlanReport
    });
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

    const historicalTestResults = await getApprovedFinalizedTestResults(
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
            (scenarioResult, i) => {
                // Check if output matches historical output
                const outputMatches =
                    historicalTestResult &&
                    historicalTestResult.scenarioResults[i] &&
                    historicalTestResult.scenarioResults[i].output ===
                        outputs[i];

                return {
                    ...scenarioResult,
                    output: outputs[i],
                    assertionResults: scenarioResult.assertionResults.map(
                        (assertionResult, j) => ({
                            ...assertionResult,
                            passed: outputMatches
                                ? historicalTestResult.scenarioResults[i]
                                      .assertionResults[j].passed
                                : false,
                            failedReason: outputMatches
                                ? historicalTestResult.scenarioResults[i]
                                      .assertionResults[j].failedReason
                                : 'AUTOMATED_OUTPUT'
                        })
                    ),
                    unexpectedBehaviors: []
                };
            }
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

module.exports = {
    cancelJob,
    getJobLog,
    updateJobStatus,
    updateJobResults
};
