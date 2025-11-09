const express = require('express');
const bodyParser = require('body-parser');
const cacheMiddleware = require('apicache').middleware;
const { session } = require('./middleware/session');
const embedApp = require('./apps/embed');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const transactionRoutes = require('./routes/transactions');
const automationSchedulerRoutes = require('./routes/automation');
const databaseRoutes = require('./routes/database');
const metricsRoutes = require('./routes/metrics');
const apolloServer = require('./graphql-server');
const {
  setupMockAutomationSchedulerServer
} = require('./tests/util/mock-automation-scheduler-server');
const transactionMiddleware = require('./middleware/transactionMiddleware');
const app = express();

// test session
app.use(session);
app.use(bodyParser.json());
app.use(transactionMiddleware.middleware);
app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/transactions', transactionRoutes);
app.use('/jobs', automationSchedulerRoutes);
app.use('/database', databaseRoutes);
app.use('/metrics', metricsRoutes);

apolloServer.start().then(() => {
  apolloServer.applyMiddleware({ app });
});

const listener = express();
listener.use('/api', app).use('/embed', embedApp);

const proxyBaseUrl = 'https://raw.githubusercontent.com';
const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/*path').get(
  cacheMiddleware('7 days', onlyStatus200),
  (req, res, next) => {
    // Extract branch and file path from the path parameter
    // 'path' comes in as array
    const pathParts = req.params.path;
    req.params.branch = pathParts[0];
    req.params.filePath = '/' + pathParts.slice(1).join('/');
    next();
  },
  async (req, res, next) => {
    try {
      const branch = req.params.branch;
      const filePath = req.params.filePath;
      const githubUrl = `${proxyBaseUrl}/w3c/aria-at/${branch}${filePath}`;

      const response = await fetch(githubUrl, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        throw new Error(
          `"/aria-at/${branch}${filePath}" returned ${response.status}`
        );
      }

      // Set proper Content-Type based on file extension
      if (filePath && filePath.includes('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (filePath && filePath.includes('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath && filePath.includes('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else {
        // Convert Headers object to plain object for res.set()
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        res.set(headers);
      }

      const data = await response.text();
      res.send(data);
    } catch (error) {
      next(error);
    }
  }
);

// Conditionally initialize github workflow service, or mock automation scheduler
if (
  process.env.ENVIRONMENT === 'production' ||
  process.env.ENVIRONMENT === 'staging' ||
  process.env.ENVIRONMENT === 'sandbox' ||
  process.env.AUTOMATION_CALLBACK_FQDN
) {
  require('./services/GithubWorkflowService').setup();
} else {
  setupMockAutomationSchedulerServer().catch(error => {
    console.error('Failed to initialize mock automation server:', error);
  });
}

app.use(transactionMiddleware.errorware);

// Error handling must be the last middleware
listener.use((error, req, res, next) => {
  console.error(error?.message || error);
  next(error);
});

module.exports = { app, listener };
