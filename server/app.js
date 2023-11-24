const express = require('express');
const bodyParser = require('body-parser');
const cacheMiddleware = require('apicache').middleware;
const proxyMiddleware = require('rawgit/lib/middleware');
const { session } = require('./middleware/session');
const embedApp = require('./apps/embed');
const testReviewApp = require('./apps/test-review');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const automationSchedulerRoutes = require('./routes/automation');
const path = require('path');
const apolloServer = require('./graphql-server');
const setupMockAutomationSchedulerServer = require('./tests/util/mock-automation-scheduler-server');
const app = express();

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/jobs', automationSchedulerRoutes);

apolloServer.start().then(() => {
    apolloServer.applyMiddleware({ app });
});

const listener = express();
listener
    .use('/api', app)
    .use('/embed', embedApp)
    .use('/test-review', testReviewApp);

const baseUrl = 'https://raw.githubusercontent.com';
const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/:branch*').get(
    cacheMiddleware('7 days', onlyStatus200),
    (req, res, next) => {
        req.url = path.join('w3c', req.url);
        next();
    },
    proxyMiddleware.fileRedirect(baseUrl),
    proxyMiddleware.proxyPath(baseUrl)
);

// Conditionally initialize github workflow service, or mock automation scheduler
if (
    process.env.ENVIRONMENT === 'production' ||
    process.env.AUTOMATION_CALLBACK_FQDN
) {
    require('./services/GithubWorkflowService')
        .setup()
        .catch(error => {
            console.error(
                'Failed to initialize github workflow service:',
                error
            );
        });
} else {
    setupMockAutomationSchedulerServer().catch(error => {
        console.error('Failed to initialize mock automation server:', error);
    });
}

// Error handling must be the last middleware
listener.use((error, req, res, next) => {
    console.error(error);
    next(error);
});

module.exports = { app, listener };
