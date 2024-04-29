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
                        impact
                        details
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

export const SCENARIO_RESULT_FIELDS = gql`
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
            assertion {
                text
            }
            passed
        }
        mustAssertionResults: assertionResults(priority: MUST) {
            assertion {
                text
            }
            passed
        }
        shouldAssertionResults: assertionResults(priority: SHOULD) {
            assertion {
                text
            }
            passed
        }
        mayAssertionResults: assertionResults(priority: MAY) {
            assertion {
                text
            }
            passed
        }
        unexpectedBehaviors {
            id
            text
            impact
            details
        }
    }
`;

export const TEST_PLAN_RUN_FIELDS = gql`
    ${TEST_PLAN_REPORT_FIELDS}
    ${SCENARIO_RESULT_FIELDS}
    fragment TestPlanRunFields on TestPlanRun {
        __typename
        id
        initiatedByAutomation
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
