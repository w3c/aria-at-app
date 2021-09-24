import { gql } from '@apollo/client';

export const REPORTS_PAGE_QUERY = gql`
    query {
        testPlanReports(statuses: [FINALIZED]) {
            id
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
                testPlan {
                    directory
                }
                metadata
            }
            runnableTests {
                id
                title
            }
            finalizedTestResults {
                id
                test {
                    id
                    title
                }
                scenarioResults {
                    scenario {
                        command {
                            id
                            text
                        }
                    }
                    output
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
