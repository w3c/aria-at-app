import { gql } from '@apollo/client';
import { SCENARIO_RESULT_FIELDS } from '../common/queries';

export const REPORTS_PAGE_QUERY = gql`
    query ReportsPageQuery {
        testPlanVersions(phases: [CANDIDATE, RECOMMENDED]) {
            id
            title
            phase
            gitSha
            updatedAt
            testPlan {
                directory
            }
            metadata
            testPlanReports(isFinal: true) {
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
    ${SCENARIO_RESULT_FIELDS}
    query ReportPageQuery($testPlanVersionId: ID) {
        testPlanVersion(id: $testPlanVersionId) {
            id
            title
            phase
            gitSha
            versionString
            testPlan {
                directory
            }
            metadata
            testPlanReports(isFinal: true) {
                id
                metrics
                markedFinalAt
                at {
                    id
                    name
                }
                browser {
                    id
                    name
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
                        ...ScenarioResultFields
                    }
                    atVersion {
                        name
                    }
                    browserVersion {
                        name
                    }
                }
                draftTestPlanRuns {
                    tester {
                        username
                    }
                    testPlanReport {
                        id
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
    }
`;
