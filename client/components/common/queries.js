import { gql } from '@apollo/client';

export const TEST_PLAN_REPORT_FIELDS = gql`
    fragment TestPlanReportFields on TestPlanReport {
        __typename
        id
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
                }
            }
        }
        at {
            id
            name
            atVersions {
                id
                name
            }
        }
        browser {
            id
            name
            browserVersions {
                id
                name
            }
        }
        testPlanVersion {
            id
            title
            phase
            updatedAt
            gitSha
            testPageUrl
            testPlan {
                directory
            }
            metadata
        }
        runnableTests {
            id
            rowNumber
            title
            ats {
                id
                name
            }
            atMode
            renderedUrl
            scenarios {
                id
                at {
                    id
                    name
                }
                commands {
                    id
                    text
                }
            }
            assertions {
                id
                priority
                text
            }
        }
    }
`;

export const ASSERTION_RESULT_FIELDS = gql`
    fragment AssertionResultFields on AssertionResult {
        __typename
        assertion {
            text
        }
        passed
        exclude
    }
`;

export const SCENARIO_RESULT_FIELDS = gql`
    ${ASSERTION_RESULT_FIELDS}
    fragment ScenarioResultFields on ScenarioResult {
        __typename
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
            ...AssertionResultFields
        }
        requiredAssertionResults: assertionResults(priority: REQUIRED) {
            ...AssertionResultFields
        }
        optionalAssertionResults: assertionResults(priority: OPTIONAL) {
            ...AssertionResultFields
        }
        mayAssertionResults: assertionResults(priority: MAY) {
            ...AssertionResultFields
        }
        unexpectedBehaviors {
            id
            text
            otherUnexpectedBehaviorText
        }
    }
`;

export const TEST_PLAN_RUN_FIELDS = gql`
    ${TEST_PLAN_REPORT_FIELDS}
    ${SCENARIO_RESULT_FIELDS}
    fragment TestPlanRunFields on TestPlanRun {
        __typename
        id
        tester {
            id
            username
        }
        testResults {
            id
            startedAt
            completedAt
            test {
                id
                rowNumber
                title
                renderedUrl
                renderableContent
            }
            scenarioResults {
                ...ScenarioResultFields
            }
            atVersion {
                id
                name
            }
            browserVersion {
                id
                name
            }
        }
        testPlanReport {
            ...TestPlanReportFields
        }
    }
`;
