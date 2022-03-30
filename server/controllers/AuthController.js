const { User } = require('../models');
const {
    getOrCreateUser,
    getUserByUsername
} = require('../models/services/UserService');
const { GithubService } = require('../services');
const getTesters = require('../util/get-testers');

const ALLOW_FAKE_ROLE = process.env.ALLOW_FAKE_ROLE === 'true';
const APP_SERVER = process.env.APP_SERVER;

const oauthRedirectToGithubController = async (req, res) => {
    const { dataFromFrontend: state } = req.query;
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

    const testers = await getTesters();

    const roles = [];
    if (isAdmin) {
        roles.push({ name: User.ADMIN });
    }
    if (isAdmin || testers.includes(githubUsername)) {
        roles.push({ name: User.TESTER }); // Admins are always testers
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

    // Allows for quickly logging in with different roles - changing
    // roles would otherwise require leaving and joining GitHub teams.
    // Should not be saved to database.
    const matchedFakeRole =
        dataFromFrontend && dataFromFrontend.match(/fakeRole-(\w*)/);
    if (ALLOW_FAKE_ROLE && matchedFakeRole) {
        user = user.get({ plain: true });
        user.roles =
            matchedFakeRole[1] === ''
                ? []
                : [{ name: matchedFakeRole[1].toUpperCase() }];
        if (user.roles[0] && user.roles[0].name === User.ADMIN) {
            user.roles.push({ name: User.TESTER }); // Admins are always testers
        }
    }
    if (user.roles.length === 0) return loginFailedDueToRole();

    req.session.user = user;

    return loginSucceeded();
};

const integrationTestSignInController = async (req, res) => {
    if (!ALLOW_FAKE_ROLE) {
        res.status(403).send('Integration test sign-in is not enabled');
        return;
    }

    if (!(req.query.role === 'admin' || req.query.role === 'tester')) {
        res.status(400).send(
            "Please provide a role query parameter of 'admin' or 'tester'"
        );
        return;
    }

    let user;
    if (req.query.role === 'admin') {
        user = await getUserByUsername(
            'esmeralda-baggins',
            undefined,
            undefined,
            [],
            []
        );
    } else {
        user = await getUserByUsername(
            'tom-proudfeet',
            undefined,
            undefined,
            [],
            []
        );
    }

    if (!user) {
        res.status(500).send('The test database is missing the expected user');
        return;
    }

    req.session.user = user.get({ plain: true });

    res.status(200).send('Integration test session started');
};

const signOutController = (req, res) => {
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
    integrationTestSignInController,
    signOutController
};
