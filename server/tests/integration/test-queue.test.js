const { gql } = require('apollo-server');
const { query, mutation } = require('../util/graphql-test-utilities');

describe('test queue', () => {
    it('displays test plan reports', async () => {
        expect(
            await query(
                gql`
                    query {
                        testPlans {
                            latestVersionOrVersionsWithDraftResults {
                                title
                                gitSha
                                gitMessage
                                testCount
                                testPlanReports {
                                    id
                                    status
                                    isAcceptingResults
                                    canBeFinalized
                                    conflictCount
                                    testPlanTarget {
                                        id
                                        title
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
                        }
                    }
                `
            )
        ).toMatchInlineSnapshot();
    });

    it('assigns testers to a test plan report', async () => {
        expect(
            await mutation(gql`
                mutation {
                    testPlanReport(id: 123) {
                        assignTester(user: 445)
                        resultingTestPlanReport {
                            draftTestPlanRuns {
                                tester {
                                    username
                                }
                            }
                        }
                    }
                }
            `)
        ).toMatchInlineSnapshot();
    });

    it('removes testers from a test plan report', async () => {
        expect(
            await mutation(gql`
                mutation {
                    testPlanReport(id: 123) {
                        deleteTestPlanRun(user: 445)
                        resultingTestPlanReport {
                            draftTestPlanRuns {
                                tester {
                                    username
                                }
                            }
                        }
                    }
                }
            `)
        ).toMatchInlineSnapshot();
    });

    it('can be finalized', async () => {
        expect(
            await mutation(gql`
                mutation {
                    testPlanReport(id: 123) {
                        updateStatus(status: FINALIZED)
                        resultingTestPlanReport {
                            supportPercent
                        }
                    }
                }
            `)
        ).toMatchInlineSnapshot();
    });
});
