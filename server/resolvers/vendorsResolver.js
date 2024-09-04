const { findAllVendors } = require('../models/services/VendorService');

const vendorsResolver = async (_, __, { user, transaction }) => {
  if (!user || !user.roles.some(role => role.name === 'ADMIN')) {
    throw new Error('Unauthorized');
  }
  return findAllVendors(transaction);
};

module.exports = {
  vendorsResolver
};
