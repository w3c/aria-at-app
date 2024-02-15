const cancelCollectionJob = require('./cancelCollectionJobResolver');
const retryCanceledCollections = require('./retryCanceledCollectionsResolver');
const deleteCollectionJob = require('./deleteCollectionJobResolver');
const restartCollectionJob = require('./restartCollectionJobResolver');
module.exports = {
    cancelCollectionJob,
    retryCanceledCollections,
    deleteCollectionJob,
    restartCollectionJob
};
