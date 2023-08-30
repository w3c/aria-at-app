const ModelService = require('./ModelService');
const { CollectionJob } = require('../');
const { COLLECTION_JOB_ATTRIBUTES } = require('./helpers');
const { Op } = require('sequelize');

/**
 * @param {string} id - id for the CollectionJob
 * @param {string} status - status for the CollectionJob
 * @param {string[]} attributes - attributes to include in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createCollectionJob = async (
    { id, status = 'QUEUED' },
    attributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    await ModelService.create(CollectionJob, { id, status }, options);

    return await ModelService.getById(
        CollectionJob,
        id,
        attributes,
        [],
        options
    );
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

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} collectionJobAttributes  - Browser attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobs = async (
    search,
    filter = {},
    collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        CollectionJob,
        where,
        collectionJobAttributes,
        [],
        pagination,
        options
    );
};

/**
 * @param {string} id - id of the CollectionJob to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} collectionJobAttributes - CollectionJob attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateCollectionJob = async (
    id,
    updateParams = {},
    collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    await ModelService.update(CollectionJob, { id }, updateParams, options);

    return await getCollectionJobById(id, collectionJobAttributes, options);
};

/**
 * Gets one CollectionJob and optionally updates it, or creates it if it doesn't exist.
 * @param {*} nestedGetOrCreateValues - These values will be used to find a matching record, or they will be used to create one
 * @param {*} nestedUpdateValues - Values which will be used when a record is found or created, but not used for the initial find
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]>}
 */
const getOrCreateCollectionJob = async ({ id, status }) => {
    const effectiveStatus = status || 'QUEUED';

    const existingJob = await getCollectionJobById(id);

    if (existingJob) {
        if (existingJob.status === effectiveStatus) {
            return existingJob;
        }

        await updateCollectionJob(id, { status: effectiveStatus });
        return await getCollectionJobById(id);
    }

    await createCollectionJob({ id, status: effectiveStatus });
    return await getCollectionJobById(id);
};

/**
 * @param {string} id - id of the CollectionJob to be deleted
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const deleteCollectionJob = async (id, options) => {
    return await ModelService.removeById(CollectionJob, id, options);
};

module.exports = {
    // Basic CRUD
    createCollectionJob,
    getCollectionJobById,
    getCollectionJobs,
    updateCollectionJob,
    deleteCollectionJob,
    // Nested CRUD
    getOrCreateCollectionJob
};
