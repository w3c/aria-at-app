import { gql } from '@apollo/client';

export const TEST_PLAN_ID_QUERY = gql`
    query TestPlanIdQuery($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            testPlanVersion {
                testPlan {
                    id
                }
            }
        }
    }
`;

export const UPDATER_QUERY = gql`
    query Updater($testPlanReportId: ID!, $testPlanId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            id
            testPlanTarget {
                at {
                    name
                    id
                }
                atVersion
                browser {
                    id
                    name
                }
                browserVersion
            }
            testPlanVersion {
                id
                title
                updatedAt
            }
        }
        testPlan(id: $testPlanId) {
            testPlanVersions {
                id
                gitMessage
                gitSha
                updatedAt
            }
        }
    }
`;

export const VERSION_QUERY = gql`
    fragment TestFragment on Test {
        __typename
        id
        title
        ats {
            id
        }
        atMode
        scenarios(atId: $atId) {
            commands {
                text
            }
        }
        assertions {
            priority
            text
        }
    }

    query VersionQuery(
        $testPlanReportId: ID!
        $testPlanVersionId: ID!
        $atId: ID!
    ) {
        testPlanReport(id: $testPlanReportId) {
            draftTestPlanRuns {
                tester {
                    id
                    username
                }
                testResults {
                    test {
                        ...TestFragment
                    }
                    completedAt
                    scenarioResults {
                        output
                        assertionResults {
                            passed
                            failedReason
                        }
                    }
                }
            }
        }
        testPlanVersion(id: $testPlanVersionId) {
            id
            tests {
                ...TestFragment
            }
        }
    }
`;

export const CREATE_TEST_PLAN_REPORT_MUTATION = gql`
    mutation CreateTestPlanReportMutation($input: TestPlanReportInput!) {
        findOrCreateTestPlanReport(input: $input) {
            populatedData {
                testPlanReport {
                    id
                }
            }
            created {
                locationOfData
                testPlanReport {
                    id
                }
            }
        }
    }
`;

export const CREATE_TEST_PLAN_RUN_MUTATION = gql`
    mutation CreateTestPlanRunMutation(
        $testPlanReportId: ID!
        $testerUserId: ID!
    ) {
        testPlanReport(id: $testPlanReportId) {
            assignTester(userId: $testerUserId) {
                testPlanRun {
                    id
                }
            }
        }
    }
`;

export const CREATE_TEST_RESULT_MUTATION = gql`
    mutation CreateTestResultMutation($testPlanRunId: ID!, $testId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            findOrCreateTestResult(testId: $testId) {
                testResult {
                    id
                    scenarioResults {
                        id
                        assertionResults {
                            id
                        }
                        unexpectedBehaviors {
                            id
                        }
                    }
                }
            }
        }
    }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
    mutation {
        testResult(id: "MzFlNeyIxMiI6MTAxfQWNiNW") {
            submitTestResult(
                input: {
                    id: "MzFlNeyIxMiI6MTAxfQWNiNW"
                    scenarioResults: [
                        {
                            id: "ZTJmMeyIxMyI6Ik16RmxOZXlJeE1pSTZNVEF4ZlFXTmlOVyJ9zBmMj"
                            output: "automatically seeded sample output"
                            assertionResults: [
                                {
                                    id: "NWFmNeyIxNCI6IlpUSm1NZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5Sjl6Qm1NaiJ9WVjNj"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "MGRmNeyIxNCI6IlpUSm1NZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5Sjl6Qm1NaiJ9jk3ZD"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "YzkyMeyIxNCI6IlpUSm1NZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5Sjl6Qm1NaiJ9zlmZG"
                                    passed: true
                                    failedReason: null
                                }
                            ]
                            unexpectedBehaviors: []
                        }
                        {
                            id: "NDFlOeyIxMyI6Ik16RmxOZXlJeE1pSTZNVEF4ZlFXTmlOVyJ9DRiMj"
                            output: "automatically seeded sample output"
                            assertionResults: [
                                {
                                    id: "ZDE5YeyIxNCI6Ik5ERmxPZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEUmlNaiJ9jMzNT"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "YjAxMeyIxNCI6Ik5ERmxPZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEUmlNaiJ9WY5Mz"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "MzczNeyIxNCI6Ik5ERmxPZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEUmlNaiJ9jIwY2"
                                    passed: true
                                    failedReason: null
                                }
                            ]
                            unexpectedBehaviors: []
                        }
                        {
                            id: "ZTc5NeyIxMyI6Ik16RmxOZXlJeE1pSTZNVEF4ZlFXTmlOVyJ92JjYj"
                            output: "automatically seeded sample output"
                            assertionResults: [
                                {
                                    id: "NDliYeyIxNCI6IlpUYzVOZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjkySmpZaiJ9zA4NT"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "NGQxNeyIxNCI6IlpUYzVOZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjkySmpZaiJ9mViZW"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "OThhNeyIxNCI6IlpUYzVOZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjkySmpZaiJ9zNmNG"
                                    passed: true
                                    failedReason: null
                                }
                            ]
                            unexpectedBehaviors: []
                        }
                        {
                            id: "OTJhZeyIxMyI6Ik16RmxOZXlJeE1pSTZNVEF4ZlFXTmlOVyJ9Dg3Nj"
                            output: "automatically seeded sample output"
                            assertionResults: [
                                {
                                    id: "ODJmNeyIxNCI6Ik9USmhaZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEZzNOaiJ9GFjYT"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "YmZhOeyIxNCI6Ik9USmhaZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEZzNOaiJ9TQyNT"
                                    passed: true
                                    failedReason: null
                                }
                                {
                                    id: "NDFjYeyIxNCI6Ik9USmhaZXlJeE15STZJazE2Um14T1pYbEplRTFwU1RaTlZFRjRabEZYVG1sT1Z5SjlEZzNOaiJ9WZiNz"
                                    passed: true
                                    failedReason: null
                                }
                            ]
                            unexpectedBehaviors: []
                        }
                    ]
                }
            ) {
                locationOfData
            }
        }
    }
`;
