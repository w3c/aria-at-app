const { User } = require('../models');
const {
    getOrCreateUser
} = require('../models/services.deprecated/UserService');
const { GithubService } = require('../services');
const getUsersFromFile = require('../util/getUsersFromFile');

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

    if (
        isAdmin ||
        vendors.findIndex(vendor => vendor.includes(githubUsername)) > -1
    ) {
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
