const express = require('express');
const bodyParser = require('body-parser');
const cacheMiddleware = require('apicache').middleware;
const proxyMiddleware = require('rawgit/lib/middleware');
const { ApolloServer } = require('apollo-server-express');
const {
    ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');
const { create } = require('express-handlebars');
const {
    ApolloClient,
    gql,
    HttpLink,
    InMemoryCache
} = require('@apollo/client');
const fetch = require('cross-fetch');
const { session } = require('./middleware/session');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const path = require('path');
const graphqlSchema = require('./graphql-schema');
const getGraphQLContext = require('./graphql-context');
const resolvers = require('./resolvers');

const app = express();

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/test', testRoutes);

// handlebars
const hbs = create({
    layoutsDir: __dirname + '/handlebars/views/layouts',
    partialsDir: __dirname + '/handlebars/views/partials',
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: require(__dirname + '/handlebars/helpers')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/handlebars/views');

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:5000/api/graphql', fetch }),
    cache: new InMemoryCache()
});

const getLatestReportsForPattern = async pattern => {
    const { data } = await client.query({
        query: gql`
            query {
                testPlanReports(statuses: [CANDIDATE, RECOMMENDED]) {
                    at {
                        name
                    }
                    browser {
                        name
                    }
                    status
                    testPlanVersion {
                        id
                        updatedAt
                        testPlan {
                            id
                        }
                    }
                    metrics
                }
            }
        `
    });

    const testPlanReports = data.testPlanReports.filter(
        report => report.testPlanVersion.testPlan.id === pattern
    );

    const latestTestPlanVersionId = testPlanReports.sort(
        (a, b) =>
            new Date(a.testPlanVersion.updatedAt) -
            new Date(b.testPlanVersion.updatedAt)
    )[0].testPlanVersion.id;

    const latestReports = testPlanReports.filter(
        report => report.testPlanVersion.id === latestTestPlanVersionId
    );

    const allBrowsers = new Set();
    let status = 'RECOMMENDED';
    const reportsByBrowser = {};

    latestReports.forEach(report => {
        allBrowsers.add(report.browser.name);
        if (report.status === 'CANDIDATE') {
            status = report.status;
        }
    });

    allBrowsers.forEach(
        browser =>
            (reportsByBrowser[browser] = latestReports.filter(
                report => report.browser.name === browser
            ))
    );

    return { allBrowsers, status, reportsByBrowser };
};

// Expects a query variable of test plan id
app.get('/embed', async (req, res) => {
    const pattern = req.query.pattern;
    const {
        allBrowsers,
        status,
        reportsByBrowser
    } = await getLatestReportsForPattern(pattern);
    res.render('main', {
        layout: 'index',
        status,
        allBrowsers,
        reportsByBrowser,
        listExists: true
    });
});

app.use(express.static(__dirname + '/handlebars/public'));

const server = new ApolloServer({
    typeDefs: graphqlSchema,
    context: getGraphQLContext,
    resolvers,
    // The newer IDE does not work because of CORS issues
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});
server.start().then(() => {
    server.applyMiddleware({ app });
});

const listener = express();
listener.use('/api', app);

const baseUrl = 'https://raw.githubusercontent.com';
const onlyStatus200 = (req, res) => res.statusCode === 200;

listener.route('/aria-at/:branch/*').get(
    cacheMiddleware('7 days', onlyStatus200),
    (req, res, next) => {
        req.url = path.join('w3c', req.url);
        next();
    },
    proxyMiddleware.fileRedirect(baseUrl),
    proxyMiddleware.proxyPath(baseUrl)
);

// Error handling must be the last middleware
listener.use((error, req, res, next) => {
    console.error(error);
    next(error);
});

module.exports = { app, listener };
