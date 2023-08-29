const axios = require('axios');
const findOrCreateCollectionJobResolver = require('../resolvers/findOrCreateCollectionJobResolver');
const updateCollectionJobResolver = require('../resolvers/updateCollectionJobResolver');

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 5000
};

const scheduleNewJob = async (req, res) => {
    try {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
            {
                test: req.body.test
            },
            axiosConfig
        );
        const { jobID, status } = automationSchedulerResponse.data;

        const graphqlResponse = await findOrCreateCollectionJobResolver(null, {
            input: { id: jobID, status }
        });

        res.json(graphqlResponse);
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
            input: { id: req.params.jobID, status }
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
    updateJobStatus
};
