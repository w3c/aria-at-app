const { User } = require('../models');
const { getOrCreateUser } = require('../models/services/UserService');
const { GithubService } = require('../services');
const getUsersFromFile = require('../util/getUsersFromFile');

const ALLOW_FAKE_ROLE = process.env.ALLOW_FAKE_ROLE === 'true';
const APP_SERVER = process.env.APP_SERVER;

const oauthRedirectToGithubController = async (req, res) => {
    const state = `${req.query.dataFromFrontend}|${req.query.fakeVendorData}`;
    const oauthUrl = GithubService.getOauthUrl({ state });
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

    const { code, state: dataFromFrontend } = req.query;

    const githubAccessToken = await GithubService.getGithubAccessToken(code);
    if (!githubAccessToken) return loginFailedDueToGitHub();

    const githubUsername = await GithubService.getGithubUsername(
        githubAccessToken
    );
    if (!githubUsername) return loginFailedDueToGitHub();

    const isAdmin = await GithubService.isMemberOfAdminTeam({
        githubAccessToken,
        githubUsername
    });
    if (isAdmin == null) return loginFailedDueToGitHub();

    const testers = await getUsersFromFile('../../testers.txt');
    const vendors = await getUsersFromFile('../../vendors.txt');

    const roles = [];
    if (isAdmin) {
        roles.push({ name: User.ADMIN });
    }
    if (isAdmin || testers.includes(githubUsername)) {
        roles.push({ name: User.TESTER }); // Admins are always testers
    }

    const vendorIdString = vendors.find(line => line.includes(githubUsername));
    if (vendorIdString) {
        roles.push({ name: User.VENDOR });
    }

    if (roles.length === 0) return loginFailedDueToRole();

    let [user] = await getOrCreateUser(
        { username: githubUsername },
        { roles },
        undefined,
        undefined,
        [],
        []
    );

    const vendorMap = {
        vispero: 'JAWS',
        apple: 'VoiceOver for macOS',
        nvaccess: 'NVDA'
    };

    if (roles[0].name.includes(User.VENDOR)) {
        const vendorCompany = vendorIdString.split('|')[1];
        user.dataValues.vendor = {
            vendorCompany,
            at: vendorMap[vendorCompany]
        };
    }

    // Allows for quickly logging in with different roles - changing
    // roles would otherwise require leaving and joining GitHub teams.
    // Should not be saved to database.
    if (dataFromFrontend) {
        const [role, company] = dataFromFrontend.split('|');
        const matchedFakeRole = role && role.match(/fakeRole-(\w*)/);
        const matchedFakeVendorCompany =
            company && company.match(/company-(\w*)/);
        if (ALLOW_FAKE_ROLE && matchedFakeRole) {
            user = user.get({ plain: true });
            user.roles =
                matchedFakeRole[1] === ''
                    ? []
                    : [{ name: matchedFakeRole[1].toUpperCase() }];
            if (user.roles[0] && user.roles[0].name === User.ADMIN) {
                user.roles.push({ name: User.TESTER }); // Admins are always testers
            }

            if (user.roles[0]?.name === User.VENDOR) {
                if (!matchedFakeVendorCompany) {
                    throw Error(
                        'Fake role vendor must also have a company query parameter.'
                    );
                }
                user.vendor = {
                    vendorCompany: matchedFakeVendorCompany[1],
                    at: vendorMap[matchedFakeVendorCompany[1]]
                };
            }
        }
    }

    if (user.roles.length === 0) return loginFailedDueToRole();

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
