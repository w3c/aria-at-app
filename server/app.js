const express = require('express');
const bodyParser = require('body-parser');
const cacheMiddleware = require('apicache').middleware;
const proxyMiddleware = require('rawgit/lib/middleware');
const { session } = require('./middleware/session');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cycleRoutes = require('./routes/cycle');
const atRoutes = require('./routes/at');
const testRoutes = require('./routes/test');
const path = require('path');

const app = express();

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/cycle', cycleRoutes);
app.use('/at', atRoutes);
app.use('/test', testRoutes);

const listener = express();
listener.use('/api', app);

const BaseURL = 'https://raw.githubusercontent.com';
const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/:branch/*').get(
    cacheMiddleware('7 days', onlyStatus200),
    (req, res, next) => {
        req.url = path.join('w3c', req.url);
        next();
    },
    proxyMiddleware.fileRedirect(BaseURL),
    proxyMiddleware.proxyPath(BaseURL)
);

module.exports = { app, listener };
