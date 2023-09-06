const axios = require('axios');
const deleteCollectionJobResolver = require('../resolvers/deleteCollectionJobResolver');
const {
    getCollectionJobById,
    updateCollectionJob,
    getOrCreateCollectionJob
} = require('../models/services/CollectionJobService');
const {
    findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const { getAtVersions } = require('../models/services/AtService');
const { getBrowserVersions } = require('../models/services/BrowserService');

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 5000
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

const updateOrCreateTestResultWithResponses = async ({
    testId,
    testPlanRun: { id: testPlanRunId },
    responses,
    atVersionId,
    browserVersionId
}) => {
    const { testResult } = await findOrCreateTestResult({
        testId,
        testPlanRunId,
        atVersionId,
        browserVersionId
    });

    const getAutomatedResultFromOutput = ({ baseTestResult, outputs }) => ({
        ...baseTestResult,
        atVersionId,
        browserVersionId,
        scenarioResults: baseTestResult.scenarioResults.map(
            (scenarioResult, index) => ({
                ...scenarioResult,
                output: outputs[index],
                assertionResults: scenarioResult.assertionResults.map(
                    assertionResult => ({
                        ...assertionResult,
                        passed: false,
                        failedReason: 'AUTOMATED_OUTPUT'
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

        if (!atVersion || !browserVersion) throw new Error('Version not found');

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
        const graphqlResponse = await deleteCollectionJobResolver(null, {
            id: req.params.jobID
        });
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
