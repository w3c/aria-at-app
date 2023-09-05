const axios = require('axios');
const findOrCreateCollectionJobResolver = require('../resolvers/findOrCreateCollectionJobResolver');
const updateCollectionJobResolver = require('../resolvers/updateCollectionJobResolver');
const deleteCollectionJobResolver = require('../resolvers/deleteCollectionJobResolver');
const {
    getCollectionJobById
} = require('../models/services/CollectionJobService');
const {
    findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const populateData = require('../services/PopulatedData/populateData');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const { getAtVersionByQuery } = require('../models/services/AtService');
const {
    getBrowserVersionByQuery
} = require('../models/services/BrowserService');

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
            await findOrCreateCollectionJobResolver(null, {
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
            await updateCollectionJobResolver(null, {
                id: req.params.jobID,
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
            await updateCollectionJobResolver(null, {
                id: req.params.jobID,
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

        const graphqlResponse = await updateCollectionJobResolver(null, {
            id: req.params.jobID,
            status
        });

        res.json(graphqlResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateOrCreateTestResultWithResponses = async ({
    testId,
    responses,
    atVersionId,
    browserVersionId
}) => {
    const { testPlanRun } = populateData({ testId });
    if (!testId) return null;

    const { testResult } = await findOrCreateTestResult(
        {
            parentContext: { id: testPlanRun.id }
        },
        { testId, atVersionId, browserVersionId }
    );

    // Likely need to convert responses into scenario results objects here

    let savedData = await saveTestResultCommon({
        testResultId: testResult.id,
        input: responses,
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
        if (!job) {
            throw new Error(`Job with id ${id} not found`);
        }
        if (job.status !== 'RUNNING') {
            throw new Error(
                `Job with id ${id} is not running, cannot update results`
            );
        }

        const atVersion = await getAtVersionByQuery({ name: atVersionName });
        const browserVersion = await getBrowserVersionByQuery({
            name: browserVersionName
        });
        await updateOrCreateTestResultWithResponses({
            testId,
            responses: responses,
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
