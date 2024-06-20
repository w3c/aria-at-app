const atResolver = require('../TestPlanReport/atResolver');
const browserResolver = require('../TestPlanReport/browserResolver');
const exactAtVersionResolver = require('../TestPlanReport/exactAtVersionResolver');
const minimumAtVersionResolver = require('../TestPlanReport/minimumAtVersionResolver');

const testPlanReportStatusesResolver = async (testPlanVersion, _, context) => {
    const { transaction, atLoader } = context;

    const ats = await atLoader.getAll({ transaction });

    const { testPlanReports, phase } = testPlanVersion;

    const indexedTestPlanReports = await indexTestPlanReports(
        testPlanReports ?? [],
        context
    );

    const populateTestPlanVersion = testPlanReport => {
        return { ...testPlanReport, testPlanVersion };
    };

    const unsortedStatuses = [];

    for (const at of ats) {
        for (const browser of at.browsers) {
            let isRequiredAtBrowser = false;
            if (phase === 'DRAFT' || phase === 'CANDIDATE') {
                isRequiredAtBrowser = at.candidateBrowsers.some(
                    candidateBrowser => candidateBrowser.id === browser.id
                );
            } else if (phase === 'RECOMMENDED') {
                isRequiredAtBrowser = at.recommendedBrowsers.some(
                    recommendedBrowser => recommendedBrowser.id === browser.id
                );
            }

            const atVersions = at.atVersions.sort((a, b) => {
                return new Date(a.releasedAt) - new Date(b.releasedAt);
            });

            const hasNoReports =
                Object.keys(indexedTestPlanReports?.[at.id]?.[browser.id] ?? {})
                    .length === 0;

            if (hasNoReports) {
                if (phase !== 'RECOMMENDED') {
                    const earliestAtVersion = at.atVersions[0];

                    unsortedStatuses.push({
                        isRequired: isRequiredAtBrowser,
                        at,
                        browser,
                        minimumAtVersion: earliestAtVersion,
                        exactAtVersion: null,
                        testPlanReport: null
                    });

                    continue;
                }

                const latestAtVersion = atVersions[atVersions.length - 1];

                unsortedStatuses.push({
                    isRequired: isRequiredAtBrowser,
                    at,
                    browser,
                    exactAtVersion: latestAtVersion,
                    testPlanReport: null
                });

                continue;
            }

            let isFirstAtBrowserInstance = true;
            let minimumAtVersionFound = false;

            Object.values(indexedTestPlanReports[at.id][browser.id]).forEach(
                testPlanReports => {
                    testPlanReports.forEach(testPlanReport => {
                        let isRequired = false;
                        if (isRequiredAtBrowser && isFirstAtBrowserInstance) {
                            isFirstAtBrowserInstance = false;
                            isRequired = true;
                        }

                        if (testPlanReport.minimumAtVersion) {
                            minimumAtVersionFound = true;
                        }

                        unsortedStatuses.push({
                            isRequired,
                            at,
                            browser,
                            minimumAtVersion: testPlanReport.minimumAtVersion,
                            exactAtVersion: testPlanReport.exactAtVersion,
                            testPlanReport:
                                populateTestPlanVersion(testPlanReport)
                        });
                    });
                }
            );

            const latestAtVersion = atVersions[atVersions.length - 1];

            if (
                !minimumAtVersionFound &&
                !indexedTestPlanReports[at.id][browser.id][latestAtVersion.id]
            ) {
                unsortedStatuses.push({
                    isRequired: false,
                    at,
                    browser,
                    minimumAtVersion: null,
                    exactAtVersion: latestAtVersion,
                    testPlanReport: null
                });
            }
        }
    }

    const statuses = unsortedStatuses.sort((a, b) => {
        if (a.at.name !== b.at.name) return a.at.name.localeCompare(b.at.name);
        if (a.browser.name !== b.browser.name) {
            return a.browser.name.localeCompare(b.browser.name);
        }
        if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
        const dateA = (a.minimumAtVersion ?? a.exactAtVersion).releasedAt;
        const dateB = (b.minimumAtVersion ?? b.exactAtVersion).releasedAt;
        return new Date(dateA) - new Date(dateB);
    });

    return statuses;
};

const indexTestPlanReports = async (unpopulatedTestPlanReports, context) => {
    const unsortedTestPlanReports = await Promise.all(
        unpopulatedTestPlanReports.map(async report => {
            const [at, browser, minimumAtVersion, exactAtVersion] =
                await Promise.all([
                    atResolver(report, null, context),
                    browserResolver(report, null, context),
                    minimumAtVersionResolver(report, null, context),
                    exactAtVersionResolver(report, null, context)
                ]);

            return {
                ...report.dataValues,
                at,
                browser,
                minimumAtVersion,
                exactAtVersion
            };
        })
    );

    const releaseOrderTestPlanReports = unsortedTestPlanReports.sort((a, b) => {
        const dateA = (a.minimumAtVersion ?? a.exactAtVersion).releasedAt;
        const dateB = (b.minimumAtVersion ?? b.exactAtVersion).releasedAt;
        if (dateA !== dateB) return new Date(dateB) - new Date(dateA);

        // With duplicate reports list the oldest first
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const indexedTestPlanReports = {};

    releaseOrderTestPlanReports.forEach(testPlanReport => {
        const { at, browser, minimumAtVersion, exactAtVersion } =
            testPlanReport;

        if (!indexedTestPlanReports[at.id]) indexedTestPlanReports[at.id] = {};
        if (!indexedTestPlanReports[at.id][browser.id]) {
            indexedTestPlanReports[at.id][browser.id] = {};
        }

        const atVersion = minimumAtVersion ?? exactAtVersion;

        if (!indexedTestPlanReports[at.id][browser.id][atVersion.id]) {
            // Must be an array to accommodate duplicates, which are allowed
            indexedTestPlanReports[at.id][browser.id][atVersion.id] = [];
        }

        indexedTestPlanReports[at.id][browser.id][atVersion.id].push(
            testPlanReport
        );
    });

    return indexedTestPlanReports;
};

module.exports = testPlanReportStatusesResolver;
