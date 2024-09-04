const { findVendorByName } = require('../models/services/VendorService');

const vendorByNameResolver = async (_, { name }, { transaction }) => {
  return findVendorByName(name, transaction);
};

module.exports = vendorByNameResolver;
