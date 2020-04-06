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
        res.redirect(303, req.session.referer);
        delete req.session.referer;
        res.end();
    }
};
