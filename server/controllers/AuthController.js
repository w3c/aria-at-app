const services = require('../services');
const { GithubService, UsersService } = services;
const OAUTH = 'oauth';

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
        const { service, referer } = req.query;
        const authService = resolveService(service);
        req.session.referer = referer;
        req.session.authType = OAUTH;
        res.redirect(303, authService.url);
        res.end();
    },

    async authorize(req, res) {
        const { service, code } = req.query;
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
