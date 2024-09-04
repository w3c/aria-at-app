const { findAllVendors } = require('../models/services/VendorService');

const vendorsResolver = async (_, __, { transaction }) => {
  // No auth since the vendors.txt file is public
  return findAllVendors(transaction);
};

module.exports = vendorsResolver;
