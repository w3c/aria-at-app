import { gql } from '@apollo/client';

export const CONFLICTING_TEST_RESULT_QUERY = gql`
    query ConflictingTestResult($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            testPlanVersion {
                title
            }
            conflicts {
                source {
                    test {
                        id
                        title
                        rowNumber
                    }
                    scenario {
                        id
                        commands {
                            text
                        }
                    }
                    assertion {
                        id
                        text
                    }
                }
                conflictingResults {
                    testPlanRun {
                        id
                        tester {
                            username
                        }
                    }
                    scenarioResult {
                        output
                        unexpectedBehaviors {
                            text
                            otherUnexpectedBehaviorText
                        }
                    }
                    assertionResult {
                        passed
                        failedReason
                    }
                }
            }
        }
    }

    # conflicts.filter(conflict => conflict.source.test.id === testId)
`;
