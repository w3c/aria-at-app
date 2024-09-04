const { findVendorById } = require('../models/services/VendorService');

const vendorResolver = async (_, { id }, { transaction }) => {
  // No auth since the vendors.txt file is public
  return findVendorById(id, transaction);
};

module.exports = vendorResolver;
