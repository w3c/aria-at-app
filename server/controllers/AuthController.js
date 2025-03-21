const { User } = require('../models');
const {
  getOrCreateUser,
  addUserVendor,
  getUserById
} = require('../models/services/UserService');
const { GithubService } = require('../services');
const getUsersFromFile = require('../util/getUsersFromFile');
const {
  findVendorByName,
  getOrCreateVendor
} = require('../models/services/VendorService');

const APP_SERVER = process.env.APP_SERVER;

const oauthRedirectToGithubController = async (req, res) => {
  const oauthUrl = GithubService.getOauthUrl();
  res.redirect(303, oauthUrl);
  res.end();
};

const oauthRedirectFromGithubController = async (req, res) => {
  const loginSucceeded = () => {
    res.redirect(303, `${APP_SERVER}/test-queue`);
  };
  const loginFailedDueToRole = async () => {
    if (req.session) {
      await new Promise(resolve => req.session.destroy(resolve));
    }
    res.redirect(303, `${APP_SERVER}/signup-instructions`);
  };
  const loginFailedDueToGitHub = () => {
    res.status(401).send(
      `<body>
                ARIA-AT App failed to access GitHub.
                <a href="${process.env.APP_SERVER}/">Return to home page.</a>
            </body>`
    );
  };

  const { code } = req.query;

  const githubAccessToken = await GithubService.getGithubAccessToken(code);
  if (!githubAccessToken) return loginFailedDueToGitHub();

  const githubUsername = await GithubService.getGithubUsername(
    githubAccessToken
  );

  if (!githubUsername) return loginFailedDueToGitHub();

  const admins = await getUsersFromFile('admins.txt');
  const testers = await getUsersFromFile('testers.txt');
  const vendors = await getUsersFromFile('vendors.txt');

  const roles = [];
  if (admins.includes(githubUsername)) {
    roles.push({ name: User.ADMIN });
  }
  if (admins.includes(githubUsername) || testers.includes(githubUsername)) {
    roles.push({ name: User.TESTER }); // Admins are always testers
  }

  if (
    admins.includes(githubUsername) ||
    vendors.some(vendor => vendor.split('|')[0] === githubUsername)
  ) {
    roles.push({ name: User.VENDOR });
  }

  if (roles.length === 0) return loginFailedDueToRole();

  let [user] = await getOrCreateUser({
    where: { username: githubUsername },
    values: { roles },
    atAttributes: [],
    testPlanRunAttributes: [],
    transaction: req.transaction
  });

  if (roles.some(role => role.name === User.VENDOR)) {
    const vendorEntry = vendors.find(
      vendor => vendor.split('|')[0] === githubUsername
    );
    if (vendorEntry) {
      const [, companyName] = vendorEntry.trim().split(/\s*\|\s*/);
      const vendor = await findVendorByName({
        name: companyName,
        transaction: req.transaction
      });
      if (vendor) {
        await addUserVendor(user.id, vendor.id, {
          transaction: req.transaction
        });
      } else {
        const vendor = await getOrCreateVendor({
          where: { name: companyName },
          transaction: req.transaction
        });
        await addUserVendor(user.id, vendor.id, {
          transaction: req.transaction
        });
      }
      // Fetch the user again with vendor and AT information
      user = await getUserById({
        id: user.id,
        vendorAttributes: ['id', 'name'],
        atAttributes: ['id', 'name'],
        includeVendorAts: true,
        transaction: req.transaction
      });
    }
  }

  req.session.user = user;

  return loginSucceeded();
};

const signoutController = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500);
    } else {
      res.status(200);
    }
    res.end();
  });
};

module.exports = {
  oauthRedirectToGithubController,
  oauthRedirectFromGithubController,
  signoutController
};
