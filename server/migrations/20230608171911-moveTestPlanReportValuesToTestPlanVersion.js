'use strict';

const {
    updateTestPlanReportTestPlanVersion
} = require('../resolvers/TestPlanReportOperations');
const BrowserLoader = require('../models/loaders/BrowserLoader');
const AtLoader = require('../models/loaders/AtLoader');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanReportsQuery = await queryInterface.sequelize.query(
                `select "TestPlanReport".id  as "testPlanReportId",
                            "TestPlanVersion".id as "testPlanVersionId",
                            directory,
                            status,
                            "testPlanVersionId",
                            "atId",
                            "browserId",
                            "updatedAt"          as "gitShaDate",
                            "TestPlanReport"."candidateStatusReachedAt",
                            "TestPlanReport"."recommendedStatusReachedAt",
                            "TestPlanReport"."recommendedStatusTargetDate"
                     from "TestPlanReport"
                              join "TestPlanVersion" on "TestPlanReport"."testPlanVersionId" = "TestPlanVersion".id
                     where status in ('CANDIDATE', 'RECOMMENDED')
                     order by title, "gitShaDate" desc`,
                {
                    transaction
                }
            );
            const testPlanReportsData = testPlanReportsQuery[0];

            const testPlanReportLatestReleasedQuery =
                async testPlanReportId => {
                    return await queryInterface.sequelize.query(
                        `select "atVersionId", name, "releasedAt", "testPlanReportId", "testerUserId", "testPlanRunId"
                            from ( select distinct "TestPlanReport".id                                              as "testPlanReportId",
                                                   "TestPlanRun".id                                                 as "testPlanRunId",
                                                   "TestPlanRun"."testerUserId",
                                                   (jsonb_array_elements("testResults") ->> 'atVersionId')::integer as "atVersionId"
                                   from "TestPlanReport"
                                            left outer join "TestPlanRun" on "TestPlanRun"."testPlanReportId" = "TestPlanReport".id
                                   where "testPlanReportId" = ${testPlanReportId}
                                   group by "TestPlanReport".id, "TestPlanRun".id ) as atVersionResults
                                     join "AtVersion" on "AtVersion".id = atVersionResults."atVersionId"
                            order by "releasedAt" desc
                            limit 1;`,
                        { transaction }
                    );
                };

            const testPlanReportsByDirectory = {};
            for (let i = 0; i < testPlanReportsData.length; i++) {
                let testPlanReport = testPlanReportsData[i];
                const testPlanReportLatestReleasedData = (
                    await testPlanReportLatestReleasedQuery(
                        testPlanReport.testPlanReportId
                    )
                )[0];
                testPlanReport.latestAtVersionReleasedAt =
                    testPlanReportLatestReleasedData[0].releasedAt;

                if (!testPlanReportsByDirectory[testPlanReport.directory])
                    testPlanReportsByDirectory[testPlanReport.directory] = [
                        testPlanReport
                    ];
                else
                    testPlanReportsByDirectory[testPlanReport.directory].push(
                        testPlanReport
                    );
            }

            // We now need to rely on a single TestPlanVersion now, rather than having consolidated
            // TestPlanReports, we need to do the following:

            // Determine which TestPlanReport is the latest TestPlanVersion for a report group
            // AND determine which TestPlanReports need to be updated to that latest version
            // (without losing data, but there may need to be some manual updates that will have to
            // happen)

            const findHighestTestPlanVersion = testPlanReportsByDirectory => {
                const result = {};

                for (const directory in testPlanReportsByDirectory) {
                    const reports = testPlanReportsByDirectory[directory];

                    let highestTestPlanVersion = 0;
                    let highestCollectiveStatus = 'RECOMMENDED';
                    let latestAtVersionReleasedAtOverall = '';
                    let latestCandidateStatusReachedAt = '';
                    let latestRecommendedStatusReachedAt = '';
                    let latestRecommendedStatusTargetDate = '';
                    let latestAtBrowserMatchings = {};

                    for (const report of reports) {
                        const {
                            testPlanVersionId,
                            status,
                            atId,
                            browserId,
                            latestAtVersionReleasedAt,
                            candidateStatusReachedAt,
                            recommendedStatusReachedAt,
                            recommendedStatusTargetDate
                        } = report;

                        // Determine which of the AT+Browser pairs should be updated (these are
                        // what's being currently displayed on the reports page for each column)
                        const uniqueAtBrowserKey = `${atId}-${browserId}`;
                        if (
                            !latestAtBrowserMatchings[uniqueAtBrowserKey] ||
                            latestAtVersionReleasedAt >
                                latestAtBrowserMatchings[uniqueAtBrowserKey]
                                    .latestAtVersionReleasedAt
                        ) {
                            latestAtBrowserMatchings[uniqueAtBrowserKey] =
                                report;

                            if (status === 'CANDIDATE')
                                highestCollectiveStatus = 'CANDIDATE';
                        }

                        if (
                            testPlanVersionId > highestTestPlanVersion ||
                            (testPlanVersionId === highestTestPlanVersion &&
                                latestAtVersionReleasedAt >
                                    latestAtVersionReleasedAtOverall)
                        ) {
                            highestTestPlanVersion = testPlanVersionId;
                            latestAtVersionReleasedAtOverall =
                                latestAtVersionReleasedAt;
                            latestCandidateStatusReachedAt =
                                candidateStatusReachedAt;
                            latestRecommendedStatusReachedAt =
                                recommendedStatusReachedAt;
                            latestRecommendedStatusTargetDate =
                                recommendedStatusTargetDate;
                        }
                    }

                    result[directory] = {
                        directory,
                        highestTestPlanVersion,
                        highestCollectiveStatus,
                        latestAtVersionReleasedAtOverall,
                        latestCandidateStatusReachedAt,
                        latestRecommendedStatusReachedAt,
                        latestRecommendedStatusTargetDate,
                        latestAtBrowserMatchings
                    };
                }

                return result;
            };

            // Find the latest testPlanVersion for each directory
            const highestVersions = findHighestTestPlanVersion(
                testPlanReportsByDirectory
            );

            const atLoader = AtLoader();
            const browserLoader = BrowserLoader();
            for (let i = 0; i < Object.values(highestVersions).length; i++) {
                const highestTestPlanVersion =
                    Object.values(highestVersions)[i];

                // Update the noted test plan versions to use the dates of the currently defined
                // "latest" test plan reports' phases
                const {
                    highestTestPlanVersion: highestTestPlanVersionId,
                    highestCollectiveStatus: phase,
                    latestCandidateStatusReachedAt: candidatePhaseReachedAt,
                    latestRecommendedStatusReachedAt: recommendedPhaseReachedAt,
                    latestRecommendedStatusTargetDate:
                        recommendedPhaseTargetDate,
                    latestAtBrowserMatchings
                } = highestTestPlanVersion;

                await queryInterface.sequelize.query(
                    `UPDATE "TestPlanVersion"
                             SET phase                        = ?,
                                 "candidatePhaseReachedAt"    = ?,
                                 "recommendedPhaseReachedAt"  = ?,
                                 "recommendedPhaseTargetDate" = ?
                             WHERE id = ?`,
                    {
                        replacements: [
                            phase,
                            candidatePhaseReachedAt,
                            recommendedPhaseReachedAt,
                            recommendedPhaseTargetDate,
                            highestTestPlanVersionId
                        ],
                        transaction
                    }
                );

                // Update the individual reports, so they can be included as part of the same phase
                // by being a part of the same test plan version
                for (const uniqueMatchKey in latestAtBrowserMatchings) {
                    const uniqueMatch =
                        latestAtBrowserMatchings[uniqueMatchKey];
                    if (
                        uniqueMatch.testPlanVersionId !==
                        highestTestPlanVersionId
                    ) {
                        // eslint-disable-next-line no-console
                        console.info(
                            `=== Updating testPlanReportId ${uniqueMatch.testPlanReportId} to testPlanVersionId ${highestTestPlanVersionId} for atId ${uniqueMatch.atId} and browserId ${uniqueMatch.browserId} ===`
                        );
                        await updateTestPlanReportTestPlanVersion(
                            {
                                parentContext: {
                                    id: uniqueMatch.testPlanReportId
                                }
                            },
                            {
                                input: {
                                    testPlanVersionId: highestTestPlanVersionId,
                                    atId: uniqueMatch.atId,
                                    browserId: uniqueMatch.browserId
                                }
                            },
                            {
                                atLoader,
                                browserLoader,
                                user: {
                                    roles: [{ name: 'ADMIN' }]
                                }
                            }
                        );
                    }
                }
            }
        });
    }
};
