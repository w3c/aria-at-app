import { gql } from '@apollo/client';

export const REPORTS_PAGE_QUERY = gql`
    query ReportsPageQuery {
        testPlanVersions(phases: [CANDIDATE, RECOMMENDED]) {
            id
            title
            phase
            candidateStatusReachedAt
            recommendedStatusReachedAt
            gitSha
            updatedAt
            testPlan {
                directory
            }
            metadata
            testPlanReports {
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
    query ReportPageQuery($testPlanVersionId: ID, $testPlanVersionIds: [ID]) {
        testPlanReports(
            statuses: [CANDIDATE, RECOMMENDED]
            testPlanVersionId: $testPlanVersionId
            testPlanVersionIds: $testPlanVersionIds
        ) {
            id
            status
            metrics
            candidateStatusReachedAt
            recommendedStatusReachedAt
            at {
                id
                name
            }
            latestAtVersionReleasedAt {
                id
                name
                releasedAt
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                testPlan {
                    directory
                }
                metadata
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
`;
