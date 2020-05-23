const path = require('path');
const cache = require('apicache').middleware;

const proxyMiddleware = require('rawgit/lib/middleware');
const BaseURL = 'https://raw.githubusercontent.com';

const { listener } = require('./app');
const port = process.env.PORT || 5000;

const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/:branch/*').get(
    cache('7 days', onlyStatus200),
    (req, res, next) => {
        req.url = path.join('w3c', req.url);
        next();
    },
    proxyMiddleware.fileRedirect(BaseURL),
    proxyMiddleware.proxyPath(BaseURL)
);

listener.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});

module.exports = { listener };
