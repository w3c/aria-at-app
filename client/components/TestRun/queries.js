import { gql } from '@apollo/client';

export const TEST_RUN_PAGE_QUERY = gql`
    query TestPlanRunPage($testPlanRunId: ID!) {
        testPlanRun(id: $testPlanRunId) {
            isComplete
            testResultCount
            tester {
                id
                username
            }
            testResults {
                title
                index
                testFilePath
                isComplete
                isSkipped
                assertions(priority: REQUIRED) {
                    command
                    priority
                    manualAssertion
                }
                assertionsCount(priority: REQUIRED)
                assertionsPassed(priority: REQUIRED)
                unexpectedBehaviorCount
                result {
                    test
                }
                serializedForm {
                    name
                }
                issues
            }
            testPlanReport {
                id
                status
                conflictCount
                testPlanTarget {
                    title
                    at {
                        name
                    }
                    atVersion
                    browser {
                        name
                    }
                    browserVersion
                }
                testPlanVersion {
                    title
                    directory
                }
            }
        }
        users {
            id
            username
        }
    }
`;
