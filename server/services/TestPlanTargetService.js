const ModelService = require('./ModelService');
const { TEST_PLAN_TARGET_ATTRIBUTES } = require('./helpers');
const { Sequelize, TestPlanTarget } = require('../models');
const { Op } = Sequelize;

// Section :- association helpers to be included with Models' results

// Section :- Basic CRUD functions
/**
 * @param {number} id
 * @param {string[]} testPlanTargetAttributes
 * @returns {Promise<void>}
 */
const getTestPlanTargetById = async (
    id,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES
) => {
    return await ModelService.getById(
        TestPlanTarget,
        id,
        testPlanTargetAttributes,
        []
    );
};

/**
 * @param search
 * @param filter
 * @param testPlanTargetAttributes
 * @param pagination
 * @returns {Promise<*>}
 */
const getTestPlanTargets = async (
    search,
    filter = {},
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        TestPlanTarget,
        where,
        testPlanTargetAttributes,
        [],
        pagination
    );
};

/**
 * @param createParams
 * @param testPlanTargetAttributes
 * @returns {Promise<void>}
 */
const createTestPlanTarget = async (
    { title, at, atVersion, browser, browserVersion },
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES
) => {
    // TODO: Check if at, atVersion, browser, browserVersion exists and create it not? Or assume they exist?
    const testPlanTargetResult = await ModelService.create(TestPlanTarget, {
        title,
        at, // TODO: If at passed in as string, check if exists in db and get the matching id
        atVersion,
        browser, // TODO: If browser passed in as string, check if exists in db and get the matching id
        browserVersion
    });
    const { id } = testPlanTargetResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        TestPlanTarget,
        id,
        testPlanTargetAttributes,
        []
    );
};

/**
 * @param id
 * @param deleteOptions
 * @returns {Promise<boolean>}
 */
const removeTestPlanTarget = async (
    id,
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeById(TestPlanTarget, id, deleteOptions);
};

module.exports = {
    // Basic CRUD
    getTestPlanTargetById,
    getTestPlanTargets,
    createTestPlanTarget,
    removeTestPlanTarget,

    // Custom Functions

    // Constants
    TEST_PLAN_TARGET_ATTRIBUTES
};
