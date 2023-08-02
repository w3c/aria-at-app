import { gql } from '@apollo/client';

export const REPORTS_PAGE_QUERY = gql`
    query ReportsPageQuery {
        testPlanVersions(phases: [CANDIDATE, RECOMMENDED]) {
            id
            title
            phase
            gitSha
            updatedAt
            testPlan {
                directory
            }
            metadata
            testPlanReports(isCurrentPhase: true) {
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
            }
        }
    }
`;

export const REPORT_PAGE_QUERY = gql`
    query ReportPageQuery($testPlanVersionId: ID) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            title
            phase
            gitSha
            updatedAt
            testPlan {
                directory
            }
            metadata
            testPlanReports {
                id
                status
                metrics
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                runnableTests {
                    id
                    title
                    renderedUrl
                }
                finalizedTestResults {
                    id
                    test {
                        id
                        rowNumber
                        title
                        renderedUrl
                    }
                    scenarioResults {
                        id
                        scenario {
                            commands {
                                id
                                text
                            }
                        }
                        output
                        assertionResults {
                            id
                            assertion {
                                text
                            }
                            passed
                            failedReason
                        }
                        requiredAssertionResults: assertionResults(
                            priority: REQUIRED
                        ) {
                            assertion {
                                text
                            }
                            passed
                            failedReason
                        }
                        optionalAssertionResults: assertionResults(
                            priority: OPTIONAL
                        ) {
                            assertion {
                                text
                            }
                            passed
                            failedReason
                        }
                        unexpectedBehaviors {
                            id
                            text
                            otherUnexpectedBehaviorText
                        }
                    }
                }
                draftTestPlanRuns {
                    tester {
                        username
                    }
                    testPlanReport {
                        id
                        status
                    }
                    testResults {
                        test {
                            id
                        }
                        atVersion {
                            id
                            name
                        }
                        browserVersion {
                            id
                            name
                        }
                        completedAt
                    }
                }
            }
        }
    }
`;
