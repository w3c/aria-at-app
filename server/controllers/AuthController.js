const services = require('../services');
const { GithubService, UsersService } = services;

const OAUTH = 'oauth';
const allowsFakeRole = process.env.ALLOW_FAKE_ROLE === 'true';

const capitalizeServiceString = service =>
    `${service.charAt(0).toUpperCase()}${service.slice(1)}`;

function destroySession(req, res) {
    req.session.destroy(err => {
        if (err) {
            res.status(500);
        } else {
            res.status(200);
        }
        res.end();
    });
}

function resolveService(service) {
    return (
        services[`${capitalizeServiceString(service)}Service`] || GithubService
    );
}

module.exports = {
    async oauth(req, res) {
        const { service, referer, dataFromFrontend } = req.query;
        const authService = resolveService(service);
        req.session.referer = referer;
        req.session.authType = OAUTH;
        const oauthServiceUrl = authService.getUrl({ state: dataFromFrontend });
        res.redirect(303, oauthServiceUrl);
        res.end();
    },

    async authorize(req, res) {
        const { service, code, state: dataFromFrontend } = req.query;
        const authService = resolveService(service);

        req.session.accessToken = await authService.authorize(code);

        let userToAuthorize;
        let authorizationError;
        try {
            userToAuthorize = await authService.getUser({
                accessToken: req.session.accessToken
            });
        } catch (error) {
            authorizationError = error;
        }
        let authorized = false;

        if (req.session.authType === OAUTH) {
            let user;

            // If this is a known user that we can authorize...
            if (userToAuthorize) {
                const { name: fullname, username, email } = userToAuthorize;
                user = await UsersService.getUser({
                    fullname,
                    username,
                    email
                });
            }

            // ...otherwise, add them as a new user.
            if (!user) {
                try {
                    user = await UsersService.signupUser({
                        accessToken: req.session.accessToken,
                        user: userToAuthorize
                    });
                } catch (error) {
                    console.error(`Error: ${error}`);
                }
            }

            // Assuming we now have a user, assign updated roles
            if (user) {
                authorized = true;
                userToAuthorize = await UsersService.getUserAndUpdateRoles({
                    accessToken: req.session.accessToken,
                    user
                });
            }
        }
        if (authorized && userToAuthorize) {
            const redirectUrl = `${req.session.referer}/test-queue`;
            req.session.user = userToAuthorize;

            // Allows for quickly logging in with different roles - changing
            // roles would otherwise require leaving and joining GitHub teams
            const matchedFakeRole =
                dataFromFrontend && dataFromFrontend.match(/fakeRole-(\w*)/);

            if (allowsFakeRole && matchedFakeRole) {
                req.session.user.roles =
                    matchedFakeRole[1] === '' ? [] : [matchedFakeRole[1]];
            }

            res.redirect(303, redirectUrl);
            res.end(() => {
                delete req.session.referer;
                delete req.session.authType;
            });
        } else {
            if (authorizationError) {
                res.status(401);
                res.end();
            } else {
                res.redirect(303, `${req.session.referer}/signupInstructions`);
                res.end(() => destroySession(req, res));
            }
        }
    },

    currentUser(req, res) {
        const { user } = req.session;
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(401);
        }
        res.end();
    },

    signout(req, res) {
        destroySession(req, res);
    }
};
