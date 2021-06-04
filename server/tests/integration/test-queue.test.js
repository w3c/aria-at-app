const { gql } = require('apollo-server');
const { dbCleaner } = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models/index');

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('test queue', () => {
    it('displays test plan reports', async () => {
        const result = await query(
            gql`
                query {
                    testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
                        id
                        status
                        conflictCount
                        testPlanTarget {
                            id
                            title
                        }
                        testPlanVersion {
                            title
                            gitSha
                            gitMessage
                            testCount
                        }
                        draftTestPlanRuns {
                            id
                            tester {
                                username
                            }
                            testResultCount
                        }
                    }
                }
            `
        );

        expect(result).toEqual({
            testPlanReports: expect.arrayContaining([
                {
                    id: expect.anything(),
                    status: expect.stringMatching(/^(DRAFT|IN_REVIEW)$/),
                    conflictCount: expect.any(Number),
                    testPlanTarget: {
                        id: expect.anything(),
                        title: expect.any(String)
                    },
                    testPlanVersion: {
                        gitSha: expect.any(String),
                        gitMessage: expect.any(String),
                        title: expect.any(String),
                        testCount: expect.any(Number)
                    },
                    draftTestPlanRuns: expect.arrayContaining([
                        {
                            id: expect.anything(),
                            testResultCount: expect.any(Number),
                            tester: expect.objectContaining({
                                username: expect.any(String)
                            })
                        }
                    ])
                }
            ])
        });
    });

    it('assigns testers to a test plan report', async () => {
        await dbCleaner(async () => {
            // A1
            const testReportId = '1';
            const newTesterId = '2';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testReportId}) {
                        draftTestPlanRuns {
                            tester {
                                id
                            }
                        }
                    }
                }
            `);
            const previousTesterIds = previous.testPlanReport.draftTestPlanRuns.map(
                testPlanRun => testPlanRun.tester.id
            );

            // A2
            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testReportId}) {
                        assignTester(userId: ${newTesterId}) {
                            testPlanReport {
                                draftTestPlanRuns {
                                    tester {
                                        id
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // prettier-ignore
            const resultTesterIds = result
                .testPlanReport
                .assignTester
                .testPlanReport
                .draftTestPlanRuns.map(testPlanRun => testPlanRun.tester.id);

            // A3
            expect(previousTesterIds).not.toEqual(
                expect.arrayContaining([newTesterId])
            );
            expect(resultTesterIds).toEqual(
                expect.arrayContaining([newTesterId])
            );
        });
    });

    it('removes testers from a test plan report', async () => {
        await dbCleaner(async () => {
            // A1
            const testPlanReportId = '1';
            const previousTesterId = '1';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        draftTestPlanRuns {
                            tester {
                                id
                            }
                        }
                    }
                }
            `);
            const previousTesterIds = previous.testPlanReport.draftTestPlanRuns.map(
                run => run.tester.id
            );

            // A2
            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        deleteTestPlanRun(userId: ${previousTesterId}) {
                            testPlanReport {
                                draftTestPlanRuns {
                                    tester {
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // prettier-ignore
            const resultTesterIds = result
                .testPlanReport
                .deleteTestPlanRun
                .testPlanReport
                .draftTestPlanRuns.map((run) => run.tester.id);

            // A3
            expect(previousTesterIds).toEqual(
                expect.arrayContaining([previousTesterId])
            );
            expect(resultTesterIds).not.toEqual(
                expect.arrayContaining([previousTesterId])
            );
        });
    });

    it('can be finalized', async () => {
        await dbCleaner(async () => {
            const testPlanReportId = '1';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        status
                    }
                }
            `);
            const previousStatus = previous.testPlanReport.status;

            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        updateStatus(status: FINALIZED) {
                            testPlanReport {
                                status
                            }
                        }
                    }
                }
            `);
            const resultStatus =
                result.testPlanReport.updateStatus.testPlanReport.status;

            expect(previousStatus).not.toBe('FINALIZED');
            expect(resultStatus).toBe('FINALIZED');
        });
    });

    it('queries for information needed to add reports', async () => {
        const result = await query(gql`
            query {
                ats {
                    id
                    name
                    atVersions
                }
                browsers {
                    id
                    name
                    browserVersions
                }
                testPlans {
                    latestTestPlanVersion(status: FINALIZED) {
                        id
                        title
                    }
                }
            }
        `);

        expect(result).toEqual(
            expect.objectContaining({
                ats: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.anything(),
                        name: 'NVDA',
                        atVersions: expect.arrayContaining(['2020.1'])
                    })
                ]),
                browsers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.anything(),
                        name: 'Firefox',
                        browserVersions: expect.arrayContaining(['88.0'])
                    })
                ])
            })
        );
    });

    it.only('supports adding reports', async () => {
        await dbCleaner(async () => {
            // A1
            const testPlanVersionId = 1;
            const atId = 1;
            const unknownAtVersion = '2221.1';
            const browserId = 1;
            const unknownBrowserVersion = '9999.0';
            const mutationToTest = async () => {
                const result = await mutate(gql`
                    mutation {
                        findOrCreateTestPlanReport(input: {
                            testPlanVersionId: ${testPlanVersionId}
                            testPlanTarget: {
                                atId: ${atId}
                                atVersion: "${unknownAtVersion}"
                                browserId: ${browserId}
                                browserVersion: "${unknownBrowserVersion}"
                            }
                        }) {
                            populatedData {
                                testPlanReport {
                                    id
                                    status
                                }
                                testPlanTarget {
                                    at {
                                        id
                                    }
                                    atVersion
                                    browser {
                                        id
                                    }
                                    browserVersion
                                }
                                testPlanVersion {
                                    id
                                }
                            }
                            created {
                                locationOfData {
                                    testPlanReportId
                                    testPlanTargetId
                                    browserId
                                    browserVersion
                                    atId
                                    atVersion
                                }
                            }
                        }
                    }
                `);
                const {
                    populatedData: {
                        testPlanReport,
                        testPlanTarget,
                        testPlanVersion
                    },
                    created
                } = result.findOrCreateTestPlanReport;
                const createdBrowserVersions = created.filter(
                    ({ locationOfData }) => locationOfData.browserVersion
                );
                const createdAtVersions = created.filter(
                    ({ locationOfData }) => locationOfData.atVersion
                );
                const createdTestPlanTargets = created.filter(
                    ({ locationOfData }) =>
                        locationOfData.testPlanTargetId &&
                        !(locationOfData.browserId || locationOfData.atId)
                );
                const createdTestPlanReports = created.filter(
                    ({ locationOfData }) =>
                        locationOfData.testPlanReportId &&
                        !locationOfData.testPlanTargetId
                );
                return {
                    testPlanReport,
                    testPlanTarget,
                    testPlanVersion,
                    created,
                    createdBrowserVersions,
                    createdAtVersions,
                    createdTestPlanTargets,
                    createdTestPlanReports
                };
            };

            // A2
            const first = await mutationToTest();
            const second = await mutationToTest();

            // A3
            expect(first.testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: 'DRAFT'
                })
            );
            expect(first.testPlanVersion).toEqual(
                expect.objectContaining({
                    id: testPlanVersionId
                })
            );
            expect(first.testPlanTarget).toEqual(
                expect.objectContaining({
                    at: expect.objectContaining({
                        id: atId
                    }),
                    atVersion: unknownAtVersion,
                    browser: expect.objectContaining({
                        id: browserId
                    }),
                    browserVersion: unknownBrowserVersion
                })
            );
            expect(first.created.length).toBe(4);
            expect(first.createdBrowserVersions.length).toBe(1);
            expect(first.createdBrowserVersions[0].browserVersion).toBe(
                unknownBrowserVersion
            );
            expect(first.createdAtVersions.length).toBe(1);
            expect(first.createdAtVersions[0].atVersion).toBe(unknownAtVersion);
            expect(first.createdTestPlanTargets.length).toBe(1);
            expect(first.createdTestPlanReports.length).toBe(1);

            expect(second.testPlanReport).toEqual(
                expect.objectContaining({
                    id: first.testPlanReport.id
                })
            );
            expect(second.testPlanTarget).toEqual(
                expect.objectContaining({
                    id: first.testPlanTarget.id
                })
            );
            expect(second.testPlanVersion).toEqual(
                expect.objectContaining({
                    id: first.testPlanVersion.id
                })
            );
            expect(second.created.length).toBe(0);
        });
    });
});
