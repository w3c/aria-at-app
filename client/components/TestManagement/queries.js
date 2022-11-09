import { gql } from '@apollo/client';

export const TEST_MANAGEMENT_PAGE_QUERY = gql`
    query TestManagementPage {
        #        me {
        #            id
        #            username
        #            roles
        #        }
        #        users {
        #            id
        #            username
        #            roles
        #        }
        ats {
            id
            name
            atVersions {
                id
                name
                releasedAt
            }
        }
        browsers {
            id
            name
        }
        testPlanVersions {
            id
            title
            gitSha
            gitMessage
            testPlan {
                directory
            }
            updatedAt
        }
        testPlanReports(statuses: [DRAFT, IN_REVIEW, FINALIZED]) {
            id
            status
            #            runnableTestsLength
            at {
                id
                name
            }
            browser {
                id
                name
            }
            testPlanVersion {
                id
                title
                gitSha
                gitMessage
                testPlan {
                    directory
                }
                updatedAt
            }
            #            draftTestPlanRuns {
            #                id
            #                tester {
            #                    id
            #                    username
            #                }
            #                testResultsLength
            #            }
        }
        #        testPlans {
        #            latestTestPlanVersion {
        #                id
        #                gitSha
        #                testPlan {
        #                    id
        #                }
        #            }
        #        }
    }
`;
