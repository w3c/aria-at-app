import { gql } from '@apollo/client';

export const UPDATER_QUERY = gql`
    query Updater($testPlanReportId: ID!) {
        testPlanReport(id: $testPlanReportId) {
            testPlanTarget {
                at {
                    name
                    id
                }
                atVersion
                browser {
                    name
                }
                browserVersion
            }
            testPlanVersion {
                title
            }
        }
        testPlan(id: "toggle-button") {
            testPlanVersions {
                gitMessage
                gitSha
                updatedAt
                id
            }
        }
    }
`;

export const VERSION_QUERY = gql`
    fragment TestFragment on Test {
        title
        ats {
            id
        }
        atMode
        scenarios(atId: 1) {
            commands {
                text
            }
        }
        assertions {
            priority
            text
        }
    }

    query Tests {
        testPlanReport(id: 1) {
            draftTestPlanRuns {
                tester {
                    id
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
        testPlanVersion(id: 150) {
            tests {
                ...TestFragment
            }
        }
    }
`;

export const createTestPlanReportMutation = gql`
    mutation {
        findOrCreateTestPlanReport(
            input: {
                testPlanVersionId: 129
                testPlanTarget: {
                    atId: 1
                    atVersion: "2021.2103.174"
                    browserId: 2
                    browserVersion: "91.0.4472"
                }
            }
        ) {
            populatedData {
                testPlanReport {
                    id
                }
            }
        }
    }
`;

export const createTestPlanRunMutation = gql`
    mutation {
        testPlanReport(id: 102) {
            assignTester(userId: 1) {
                testPlanRun {
                    id
                }
            }
        }
    }
`;

export const createTestResultMutation = gql`
    mutation {
        testPlanRun(id: 101) {
            findOrCreateTestResult(testId: "MTAzOeyIyIjoiMTI5In0GIzOD") {
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

export const submitTestResultMutation = gql`
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
