import { gql } from '@apollo/client';

export const REPORTS_PAGE_QUERY = gql`
    query {
        testPlanReports(statuses: [IN_REVIEW, FINALIZED]) {
            id
            status
            testPlanTarget {
                id
                at {
                    id
                    name
                }
                browser {
                    id
                    name
                }
                atVersion
                browserVersion
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
                    title
                    renderedUrl
                }
                scenarioResults {
                    id
                    scenario {
                        command {
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
        }
    }
`;
