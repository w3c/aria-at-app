const cancelCollectionJob = require('./cancelCollectionJobResolver');
const retryCanceledCollections = require('./retryCanceledCollectionsResolver');
const deleteCollectionJob = require('./deleteCollectionJobResolver');
module.exports = {
    cancelCollectionJob,
    retryCanceledCollections,
    deleteCollectionJob
};
