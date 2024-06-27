const {
  getCollectionJobById
} = require('../models/services/CollectionJobService');

const verifyAutomationScheduler = async (req, res, next) => {
  const incomingSecret = req.headers['x-automation-secret'];
  const { jobID: id } = req.params;

  if (!id) return res.status(404).json({ error: 'unknown jobId param' });
  const job = await getCollectionJobById({
    id,
    transaction: req.transaction
  });
  if (!job)
    return res
      .status(404)
      .json({ error: `Could not find job with jobId: ${id}` });

  // store the collection job on the request to avoid a second lookup
  req.collectionJob = job;

  if (incomingSecret && incomingSecret === job.secret) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

module.exports = { verifyAutomationScheduler };
