const ModelService = require('./ModelService');
const { CollectionJob } = require('../');
const { COLLECTION_JOB_ATTRIBUTES } = require('./helpers');

/**
 * @param {string} id - id for the CollectionJob
 * @param {string} status - status for the CollectionJob
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createCollectionJob = async (id, status, options) => {
    await ModelService.create(CollectionJob, { id, status }, options);

    return await ModelService.getById(CollectionJob, id, [], [], options);
};

/**
 * @param {string} id - id for the CollectionJob
 * @param {string[]} attributes - attributes to include in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobById = async (
    id,
    attributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    return await ModelService.getById(
        CollectionJob,
        id,
        attributes,
        [],
        options
    );
};

module.exports = {
    // Basic CRUD
    createCollectionJob,
    getCollectionJobById
};
