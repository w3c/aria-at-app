const services = require('../services');

const capitalizeServiceString = service =>
    `${service.charAt(0).toUpperCase()}${service.slice(1)}`;

module.exports = {
    login(req, res) {
        const { service, referer } = req.query;
        const authService =
            services[`${capitalizeServiceString(service)}Service`] ||
            services.GithubService;
        req.session.referer = referer;
        const loginURL = authService.url;
        res.redirect(303, loginURL);
        res.end();
    },

    async authorize(req, res) {
        const { service, code } = req.query;
        const authService =
            services[`${service}Service`] || services.GithubService;
        req.session.accessToken = await authService.authorize(code);
        try {
            req.session.user = await authService.getUser({
                accessToken: req.session.accessToken
            });
        } catch (error) {
            res.status(401);
            res.end();
        }
        res.redirect(303, `${req.session.referer}?login=true`);
        delete req.session.referer;
        res.end();
    },

    currentUser(req, res) {
        const { user } = req.session;
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(401);
        }
        res.end();
    }
};
