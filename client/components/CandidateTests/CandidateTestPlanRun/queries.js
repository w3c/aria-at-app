import { gql } from '@apollo/client';

export const ADD_VIEWER_MUTATION = gql`
    mutation AddViewerMutation($testPlanVersionId: ID!, $testId: ID!) {
        addViewer(testPlanVersionId: $testPlanVersionId, testId: $testId) {
            username
        }
    }
`;

export const PROMOTE_VENDOR_REVIEW_STATUS_REPORT_MUTATION = gql`
    mutation UpdateVendorReviewStatusReport(
        $testReportId: ID!
        $reviewStatus: String!
    ) {
        testPlanReport(id: $testReportId) {
            promoteVendorReviewStatus(vendorReviewStatus: $reviewStatus) {
                testPlanReport {
                    id
                    vendorReviewStatus
                }
            }
        }
    }
`;

export const CANDIDATE_REPORTS_QUERY = gql`
    query CandidateReportsQuery(
        $atId: ID!
        $testPlanVersionId: ID
        $testPlanVersionIds: [ID]
    ) {
        me {
            id
            roles
            username
        }
        testPlanReports(
            atId: $atId
            statuses: [CANDIDATE]
            testPlanVersionId: $testPlanVersionId
            testPlanVersionIds: $testPlanVersionIds
        ) {
            id
            vendorReviewStatus
            issues {
                author
                feedbackType
                testNumberFilteredByAt
                link
            }
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
                testPageUrl
                updatedAt
                candidateStatusReachedAt
                recommendedStatusTargetDate
            }
            runnableTests {
                id
                title
                renderedUrl
                renderableContent
                viewers {
                    username
                }
            }
            finalizedTestResults {
                id
                completedAt
                test {
                    id
                    rowNumber
                    title
                    renderedUrl
                    renderableContent
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
