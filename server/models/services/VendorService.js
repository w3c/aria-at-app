const { Vendor, At, User } = require('../');

const findVendorById = async (id, transaction) => {
  return Vendor.findByPk(id, {
    include: [{ model: At, as: 'ats' }],
    transaction
  });
};

const findVendorByName = async (name, transaction) => {
  return Vendor.findOne({
    where: { name },
    include: [{ model: At, as: 'ats' }],
    transaction
  });
};

const findAllVendors = async transaction => {
  return Vendor.findAll({
    include: [
      { model: At, as: 'ats' },
      { model: User, as: 'users' }
    ],
    transaction
  });
};

const getOrCreateVendor = async ({ where, transaction }) => {
  const [vendor, created] = await Vendor.findOrCreate({
    where,
    transaction
  });
  return [vendor, created];
};

module.exports = {
  findVendorById,
  findVendorByName,
  getOrCreateVendor,
  findAllVendors
};
