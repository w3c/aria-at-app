const verifyAutomationScheduler = (req, res, next) => {
    const incomingSecret = req.headers['x-automation-secret'];

    if (
        incomingSecret &&
        incomingSecret === process.env.AUTOMATION_SCHEDULER_SECRET
    ) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};

module.exports = { verifyAutomationScheduler };
