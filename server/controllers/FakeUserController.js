const {
  getOrCreateUser,
  addUserVendor,
  getUserById
} = require('../models/services/UserService');
const {
  getOrCreateVendor,
  updateVendorById
} = require('../models/services/VendorService');

const ALLOW_FAKE_USER = process.env.ALLOW_FAKE_USER === 'true';

const setFakeUserController = async (req, res) => {
  if (!ALLOW_FAKE_USER) {
    return res.status(400).send('Feature not supported in this environment');
  }

  const userToCreate = req.body;
  if (
    !userToCreate ||
    !userToCreate.username ||
    !userToCreate?.roles.length ||
    userToCreate.roles.some(
      role => !['TESTER', 'ADMIN', 'VENDOR'].includes(role.name)
    )
  ) {
    return res.status(400).send('Invalid user');
  }

  let [user] = await getOrCreateUser({
    where: { username: userToCreate.username },
    values: { roles: userToCreate.roles },
    transaction: req.transaction
  });

  if (userToCreate.company) {
    const [vendor] = await getOrCreateVendor({
      where: { name: userToCreate.company.name },
      transaction: req.transaction
    });

    await addUserVendor(user.id, vendor.id, { transaction: req.transaction });
    await updateVendorById({
      id: vendor.id,
      ats: userToCreate.company.ats,
      transaction: req.transaction
    });

    // Refresh user to include updated associations
    user = await getUserById({
      id: user.id,
      vendorAttributes: ['id', 'name'],
      atAttributes: ['id', 'name'],
      includeVendorAts: true,
      transaction: req.transaction
    });
  }

  req.session.user = user;

  res.status(200).send('');
};

module.exports = setFakeUserController;
