const { getOrCreateUser } = require('../models/services/UserService');

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

  req.session.user = user;

  res.status(200).send('');
};

module.exports = setFakeUserController;
