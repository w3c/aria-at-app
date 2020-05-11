const services = require('../services');
const { GithubService, UsersService } = services;
const SIGN_UP = 'signup';
const LOGIN = 'login';

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

module.exports = {
    async oauth(req, res) {
        const { service, referer, type } = req.query;
        const authService =
            services[`${capitalizeServiceString(service)}Service`] ||
            GithubService;
        req.session.referer = referer;
        req.session.authType = type;
        const loginURL = authService.url;
        res.redirect(303, loginURL);
        res.end();
    },

    async authorize(req, res) {
        const { service, code } = req.query;
        const authService =
            services[`${capitalizeServiceString(service)}Service`] ||
            GithubService;

        req.session.accessToken = await authService.authorize(code);

        let userToAuthorize;
        try {
            userToAuthorize = await authService.getUser({
                accessToken: req.session.accessToken
            });
        } catch (error) {
            res.status(401);
            res.end();
            return;
        }
        let authorized = false;
        if (
            req.session.authType === SIGN_UP ||
            req.session.authType === LOGIN
        ) {
            let user;

            if (req.session.authType === SIGN_UP) {
                user = await UsersService.signupUser({
                    accessToken: req.session.accessToken,
                    user: userToAuthorize
                });
            } else {
                const { name: fullname, username, email } = userToAuthorize;
                user = {
                    fullname,
                    username,
                    email
                };
            }

            if (user) {
                authorized = true;
                userToAuthorize = await UsersService.getUserAndUpdateRoles({
                    accessToken: req.session.accessToken,
                    user
                });
            }
        }
        if (authorized && userToAuthorize) {
            req.session.user = userToAuthorize;
            res.redirect(303, `${req.session.referer}`);
            res.end(() => {
                delete req.session.referer;
                delete req.session.authType;
            });
        } else {
            res.redirect(303, `${req.session.referer}/signupInstructions`);
            res.end(() => destroySession(req, res));
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

    logout(req, res) {
        destroySession(req, res);
    }
};
