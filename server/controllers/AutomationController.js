const axios = require('axios');
const {
    getCollectionJobById,
    updateCollectionJobById,
    updateCollectionJobTestStatusByQuery
} = require('../models/services/CollectionJobService');
const {
    findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const {
    getAts,
    findOrCreateAtVersion
} = require('../models/services/AtService');
const {
    getBrowsers,
    findOrCreateBrowserVersion
} = require('../models/services/BrowserService');
const { HttpQueryError } = require('apollo-server-core');
const { COLLECTION_JOB_STATUS } = require('../util/enums');
const populateData = require('../services/PopulatedData/populateData');
const {
    getFinalizedTestResults
} = require('../models/services/TestResultReadService');
const http = require('http');
const { NO_OUTPUT_STRING } = require('../util/constants');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const getGraphQLContext = require('../graphql-context');
const httpAgent = new http.Agent({ family: 4 });

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 1000,
    httpAgent
};

const throwNoJobFoundError = jobId => {
    throw new HttpQueryError(
        404,
        `Could not find job with jobId: ${jobId}`,
        true
    );
};

const throwNoTestFoundError = rowNumber => {
    throw new HttpQueryError(
        404,
        `Could not find test at row number ${rowNumber}`,
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
        const graphqlRes = await updateCollectionJobById({
            id: req.params.jobID,
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            transaction: req.transaction
        });
        if (!graphqlRes) {
            throwNoJobFoundError(req.params.jobID);
        }
    }
    res.json(automationSchedulerResponse.data);
};

const updateJobStatus = async (req, res) => {
    const { status, externalLogsUrl } = req.body;

    if (!Object.values(COLLECTION_JOB_STATUS).includes(status)) {
        throw new HttpQueryError(400, `Invalid status: ${status}`, true);
    }

    const updatePayload = {
        status,
        ...(externalLogsUrl != null && { externalLogsUrl })
    };

    // When new status is 'COMPLETED' or 'ERROR' or 'CANCELLED'
    // update any CollectionJobTestStatus children still 'QUEUED' to be 'CANCELLED'
    if (
        status === COLLECTION_JOB_STATUS.COMPLETED ||
        status === COLLECTION_JOB_STATUS.CANCELLED ||
        status === COLLECTION_JOB_STATUS.ERROR
    ) {
        await updateCollectionJobTestStatusByQuery({
            where: {
                collectionJobId: req.params.jobID,
                status: COLLECTION_JOB_STATUS.QUEUED
            },
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            transaction: req.transaction
        });
    }

    const graphqlResponse = await updateCollectionJobById({
        id: req.params.jobID,
        values: updatePayload,
        transaction: req.transaction
    });

    if (!graphqlResponse) {
        throwNoJobFoundError(req.params.jobID);
    }

    res.json(graphqlResponse);
};

const getApprovedFinalizedTestResults = async (testPlanRun, context) => {
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

    const { testPlanReport } = await populateData(
        { testPlanReportId: testPlanRun.testPlanReport.id },
        { context }
    );

    return getFinalizedTestResults({ testPlanReport, context });
};

const getTestByRowIdentifer = async ({
    testPlanRun,
    testRowIdentifier,
    context
}) => {
    const tests = await runnableTestsResolver(
        testPlanRun.testPlanReport,
        null,
        context
    );
    return tests.find(
        test => parseInt(test.rowNumber, 10) === testRowIdentifier
    );
};

const updateOrCreateTestResultWithResponses = async ({
    testId,
    testPlanRun,
    responses,
    atVersionId,
    browserVersionId,
    context
}) => {
    const { testResult } = await findOrCreateTestResult({
        testId,
        testPlanRunId: testPlanRun.id,
        atVersionId,
        browserVersionId,
        context
    });

    const historicalTestResults = await getApprovedFinalizedTestResults(
        testPlanRun,
        context
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
                    unexpectedBehaviors: null
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
        isSubmit: false,
        context
    });
};

const updateJobResults = async (req, res) => {
    const id = req.params.jobID;
    const context = getGraphQLContext({ req });
    const { transaction } = context;
    const {
        // Old way - testCsvRow and presentationNumber can be removed
        // once all requests from automation are using the new URL parameter
        testCsvRow,
        presentationNumber,
        responses,
        status,
        capabilities: {
            atName,
            atVersion: atVersionName,
            browserName,
            browserVersion: browserVersionName
        }
    } = req.body;
    const job = await getCollectionJobById({ id, transaction });
    if (!job) {
        throwNoJobFoundError(id);
    }

    if (job.status !== COLLECTION_JOB_STATUS.RUNNING) {
        throw new Error(
            `Job with id ${id} is not running, cannot update results`
        );
    }
    if (status && !Object.values(COLLECTION_JOB_STATUS).includes(status)) {
        throw new HttpQueryError(400, `Invalid status: ${status}`, true);
    }
    const { testPlanRun } = job;

    // New way: testRowNumber is now a URL request param
    // Old way: v1 tests store testCsvRow in rowNumber, v2 tests store presentationNumber in rowNumber
    const testRowIdentifier =
        req.params.testRowNumber ?? presentationNumber ?? testCsvRow;
    const testId = (
        await getTestByRowIdentifer({
            testPlanRun,
            testRowIdentifier,
            context
        })
    )?.id;

    if (testId === undefined) {
        throwNoTestFoundError(testRowIdentifier);
    }

    // status only update, or responses were provided (default to complete)
    if (status || responses) {
        await updateCollectionJobTestStatusByQuery({
            where: { collectionJobId: id, testId },
            // default to completed if not specified (when results are present)
            values: { status: status ?? COLLECTION_JOB_STATUS.COMPLETED },
            transaction: req.transaction
        });
    }

    // responses were provided
    if (responses) {
        /* TODO: Change this to use a better key based lookup system after gh-958 */
        const [at] = await getAts({ search: atName, transaction });
        const [browser] = await getBrowsers({
            search: browserName,
            transaction
        });

        const [atVersion, browserVersion] = await Promise.all([
            findOrCreateAtVersion({
                where: { atId: at.id, name: atVersionName },
                transaction
            }),
            findOrCreateBrowserVersion({
                where: { browserId: browser.id, name: browserVersionName },
                transaction
            })
        ]);

        const processedResponses =
            convertEmptyStringsToNoOutputMessages(responses);

        await updateOrCreateTestResultWithResponses({
            testId,
            responses: processedResponses,
            testPlanRun,
            atVersionId: atVersion.id,
            browserVersionId: browserVersion.id,
            context
        });
    }

    res.json({ success: true });
};

// Human test runners are able to use a checkbox to indicate no output was detected.
// This checkbox stores 'No output was detected.' as the output value for that scenarioResult.
const convertEmptyStringsToNoOutputMessages = outputs =>
    outputs.map(output =>
        output === null || output.trim() === '' ? NO_OUTPUT_STRING : output
    );

module.exports = {
    cancelJob,
    updateJobStatus,
    updateJobResults,
    axiosConfig
};
