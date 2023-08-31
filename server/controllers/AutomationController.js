const axios = require('axios');
const findOrCreateCollectionJobResolver = require('../resolvers/findOrCreateCollectionJobResolver');
const updateCollectionJobResolver = require('../resolvers/updateCollectionJobResolver');
const deleteCollectionJobResolver = require('../resolvers/deleteCollectionJobResolver');

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
    deleteJob
};
