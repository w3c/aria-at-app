const express = require('express');
const path = require('path');
const { create } = require('express-handlebars');
const { gql } = require('apollo-server-core');
const apolloServer = require('../graphql-server');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');
const hash = require('object-hash');

const app = express();

const handlebarsPath = path.resolve(__dirname, '../handlebars/embed');

// handlebars
const hbs = create({
    layoutsDir: path.resolve(handlebarsPath, 'views/layouts'),
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: require(path.resolve(handlebarsPath, 'helpers'))
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.resolve(handlebarsPath, 'views'));

// Prevent refreshing cached data for five seconds - using a short time like
// this is possible because the stale-while-revalidate caching strategy works in
// the background and doesn't spin up more than one simultaneous request.
//
// If queries are very slow, anyone trying to get the refreshed data will get
// stale data for however long it takes for the query to complete.
const millisecondsUntilStale = 5000;

const queryReports = async testPlanDirectory => {
    const { data, errors } = await apolloServer.executeOperation({
        query: gql`
            query TestPlanQuery($testPlanDirectory: ID!) {
                ats {
                    id
                    name
                    browsers {
                        id
                        name
                    }
                }
                testPlan(id: $testPlanDirectory) {
                    testPlanVersions {
                        id
                        title
                        phase
                        testPlanReports(isFinal: true) {
                            id
                            metrics
                            at {
                                id
                                name
                            }
                            browser {
                                id
                                name
                            }
                            latestAtVersionReleasedAt {
                                id
                                name
                                releasedAt
                            }
                        }
                    }
                }
                # testPlanReports(
                #     testPlanVersionPhases: [CANDIDATE, RECOMMENDED]
                #     isFinal: true
                # ) {
                #     id
                #     metrics
                #     at {
                #         id
                #         name
                #     }
                #     browser {
                #         id
                #         name
                #     }
                #     latestAtVersionReleasedAt {
                #         id
                #         name
                #         releasedAt
                #     }
                #     testPlanVersion {
                #         id
                #         title
                #         phase
                #         updatedAt
                #         testPlan {
                #             id
                #         }
                #     }
                # }
            }
        `,
        variables: { testPlanDirectory }
    });

    if (errors) {
        throw new Error(errors);
    }

    // const reportsHashed = hash(data.testPlanReports);

    return {
        allTestPlanReports: data.testPlanReports,
        // reportsHashed,
        ats: data.ats
    };
};

// As of now, a full query for the complete list of reports is needed to build
// the embed for a single pattern. This caching allows that query to be reused
// between pattern embeds.

const queryReportsCached = staleWhileRevalidate(queryReports, {
    millisecondsUntilStale
});

const getLatestReportsForPattern = ({ allTestPlanReports, pattern }) => {
    let title;

    const testPlanReports = allTestPlanReports.filter(report => {
        if (report.testPlanVersion.testPlan.id === pattern) {
            title = report.testPlanVersion.title;
            return true;
        }
    });

    let allAts = new Set();
    let allBrowsers = new Set();
    let allAtVersionsByAt = {};
    let reportsByAt = {};
    let testPlanVersionIds = new Set();
    const uniqueReports = [];
    let latestReports = [];

    testPlanReports.forEach(report => {
        allAts.add(report.at.name);
        allBrowsers.add(report.browser.name);

        if (!allAtVersionsByAt[report.at.name])
            allAtVersionsByAt[report.at.name] =
                report.latestAtVersionReleasedAt;
        else if (
            new Date(report.latestAtVersionReleasedAt.releasedAt) >
            new Date(allAtVersionsByAt[report.at.name].releasedAt)
        ) {
            allAtVersionsByAt[report.at.name] =
                report.latestAtVersionReleasedAt;
        }

        const sameAtAndBrowserReports = testPlanReports.filter(
            r =>
                r.at.name === report.at.name &&
                r.browser.name === report.browser.name
        );

        // Only add a group of reports with same
        // AT and browser once
        if (
            !uniqueReports.find(group =>
                group.some(
                    g =>
                        g.at.name === report.at.name &&
                        g.browser.name === report.browser.name
                )
            )
        ) {
            uniqueReports.push(sameAtAndBrowserReports);
        }

        testPlanVersionIds.add(report.testPlanVersion.id);
    });

    uniqueReports.forEach(group => {
        if (group.length <= 1) {
            latestReports.push(group.pop());
        } else {
            const latestReport = group
                .sort(
                    (a, b) =>
                        new Date(a.latestAtVersionReleasedAt.releasedAt) -
                        new Date(b.latestAtVersionReleasedAt.releasedAt)
                )
                .pop();

            latestReports.push(latestReport);
        }
    });

    allBrowsers = Array.from(allBrowsers).sort();
    testPlanVersionIds = Array.from(testPlanVersionIds);

    const allAtsAlphabetical = Array.from(allAts).sort((a, b) =>
        a.localeCompare(b)
    );
    allAtsAlphabetical.forEach(at => {
        reportsByAt[at] = latestReports
            .filter(report => report.at.name === at)
            .sort((a, b) => a.browser.name.localeCompare(b.browser.name));
    });

    const hasAnyCandidateReports = Object.values(reportsByAt).find(atReports =>
        atReports.some(report => report.testPlanVersion.phase === 'CANDIDATE')
    );
    let phase = hasAnyCandidateReports ? 'CANDIDATE' : 'RECOMMENDED';

    return {
        title,
        allBrowsers,
        allAtVersionsByAt,
        testPlanVersionIds,
        phase,
        reportsByAt,
        latestReports
    };
};
const priorities = ['"Must" Assertion Priority', '"Should" Assertion Priority'];
const renderEmbed = ({
    ats,
    allTestPlanReports,
    queryTitle,
    priorities,
    pattern,
    protocol,
    host
}) => {
    const {
        title,
        allBrowsers,
        allAtVersionsByAt,
        testPlanVersionIds,
        phase,
        reportsByAt,
        latestReports
    } = getLatestReportsForPattern({ allTestPlanReports, pattern });
    const allAtBrowserCombinations = Object.fromEntries(
        ats.map(at => {
            return [
                at.name,
                at.browsers.map(browser => {
                    return browser.name;
                })
            ];
        })
    );

    return hbs.renderView(path.resolve(handlebarsPath, 'views/main.hbs'), {
        layout: 'index',
        dataEmpty: Object.keys(reportsByAt).length === 0,
        allAtBrowserCombinations,
        title: queryTitle || title || 'Pattern Not Found',
        pattern,
        priorities,
        phase,
        allBrowsers,
        allAtVersionsByAt,
        reportsByAt,
        latestReports,
        completeReportLink: `${protocol}${host}/report/${testPlanVersionIds.join(
            ','
        )}`,
        embedLink: `${protocol}${host}/embed/reports/${pattern}`
    });
};

// Limit the number of times the template is rendered
const renderEmbedCached = staleWhileRevalidate(renderEmbed, {
    getCacheKeyFromArguments: ({ reportsHashed, pattern }) =>
        reportsHashed + pattern,
    millisecondsUntilStale
});

app.get('/reports/:pattern', async (req, res) => {
    // In the instance where an editor doesn't want to display a certain title
    // as it has defined when importing into the ARIA-AT database for being too
    // verbose, etc. eg. `Link Example 1 (span element with text content)`
    // Usage: https://aria-at.w3.org/embed/reports/command-button?title=Link+Example+(span+element+with+text+content)
    const queryTitle = req.query.title;
    const pattern = req.params.pattern;
    const host = req.headers.host;
    const protocol = /dev|vagrant/.test(process.env.ENVIRONMENT)
        ? 'http://'
        : 'https://';
    const { allTestPlanReports, reportsHashed, ats } = await queryReportsCached(
        pattern
    );
    const embedRendered = await renderEmbedCached({
        ats,
        allTestPlanReports,
        reportsHashed,
        priorities,
        queryTitle,
        pattern,
        protocol,
        host
    });

    // Disable browser-based caching which could potentially make the embed
    // contents appear stale even after being refreshed
    res.set('cache-control', 'must-revalidate').send(embedRendered);
});

app.use(express.static(path.resolve(`${handlebarsPath}/public`)));

module.exports = app;
