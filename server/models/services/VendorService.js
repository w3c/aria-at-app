const ModelService = require('./ModelService');
const {
  VENDOR_ATTRIBUTES,
  AT_ATTRIBUTES,
  USER_ATTRIBUTES
} = require('./helpers');
const { Vendor } = require('../');
const { Op } = require('sequelize');

// Association helpers

const atAssociation = atAttributes => ({
  association: 'ats',
  attributes: atAttributes
});

const userAssociation = userAttributes => ({
  association: 'users',
  attributes: userAttributes
});

/**
 * @param {object} options
 * @param {number} options.id - id of Vendor to be retrieved
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const findVendorById = async ({
  id,
  vendorAttributes = VENDOR_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(Vendor, {
    id,
    attributes: vendorAttributes,
    include: [atAssociation(atAttributes), userAssociation(userAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.name - name of Vendor to be retrieved
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const findVendorByName = async ({
  name,
  vendorAttributes = VENDOR_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getByQuery(Vendor, {
    where: { name },
    attributes: vendorAttributes,
    include: [atAssociation(atAttributes), userAssociation(userAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const findAllVendors = async ({
  search,
  where = {},
  vendorAttributes = VENDOR_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  const searchQuery = search ? `%${search}%` : '';
  if (searchQuery) {
    where = { ...where, name: { [Op.iLike]: searchQuery } };
  }

  return ModelService.get(Vendor, {
    where,
    attributes: vendorAttributes,
    include: [atAssociation(atAttributes), userAssociation(userAttributes)],
    pagination,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - conditions to find or create the Vendor
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, boolean]>}
 */
const getOrCreateVendor = async ({
  where,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  const [vendor, created] = await Vendor.findOrCreate({
    where,
    attributes: vendorAttributes,
    transaction
  });
  return [vendor, created];
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the Vendor
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createVendor = async ({
  values,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  const vendorResult = await ModelService.create(Vendor, {
    values,
    transaction
  });
  const { id } = vendorResult;

  return ModelService.getById(Vendor, {
    id,
    attributes: vendorAttributes,
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the Vendor record to be updated
 * @param {object} options.values - values to be used to update columns for the record
 * @param {string[]} options.vendorAttributes - Vendor attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateVendorById = async ({
  id,
  values,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(Vendor, {
    where: { id },
    values,
    transaction
  });

  return ModelService.getById(Vendor, {
    id,
    attributes: vendorAttributes,
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the Vendor record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeVendorById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(Vendor, { id, truncate, transaction });
};

module.exports = {
  findVendorById,
  findVendorByName,
  findAllVendors,
  getOrCreateVendor,
  createVendor,
  updateVendorById,
  removeVendorById
};
