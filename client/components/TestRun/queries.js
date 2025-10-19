import { gql } from '@apollo/client';
import {
  AT_FIELDS,
  AT_VERSION_FIELDS,
  EVENT_FIELDS,
  BROWSER_FIELDS,
  BROWSER_VERSION_FIELDS,
  COLLECTION_JOB_FIELDS,
  ME_FIELDS,
  SCENARIO_RESULT_FIELDS,
  TEST_FIELDS,
  TEST_PLAN_REPORT_CONFLICT_FIELDS,
  TEST_PLAN_VERSION_FIELDS,
  TEST_RESULT_FIELDS,
  USER_FIELDS
} from '@components/common/fragments';

export const TEST_RUN_PAGE_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${EVENT_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${COLLECTION_JOB_FIELDS}
  ${ME_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  ${TEST_FIELDS()}
  ${TEST_FIELDS('all')}
  ${TEST_PLAN_REPORT_CONFLICT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${USER_FIELDS}
  query TestPlanRunPage($testPlanRunId: ID!) {
    testPlanRun(id: $testPlanRunId) {
      id
      initiatedByAutomation
      collectionJob {
        ...CollectionJobFields
      }
      tester {
        ...UserFields
      }
      testResults {
        ...TestResultFields
        test {
          ...TestFieldsSimple
          renderableContent
        }
        scenarioResults {
          ...ScenarioResultFieldsAll
        }
        atVersion {
          ...AtVersionFields
        }
        browserVersion {
          ...BrowserVersionFields
        }
      }
      testPlanReport {
        id
        onHold
        isRerun
        conflicts {
          ...TestPlanReportConflictFields
        }
        events {
          ...EventFields
        }
        at {
          ...AtFields
          atVersions {
            ...AtVersionFields
          }
        }
        minimumAtVersion {
          ...AtVersionFields
        }
        exactAtVersion {
          ...AtVersionFields
        }
        browser {
          ...BrowserFields
          browserVersions {
            ...BrowserVersionFields
          }
        }
        testPlanVersion {
          ...TestPlanVersionFields
        }
        runnableTests {
          ...TestFieldsAll
          renderableContent
        }
        draftTestPlanRuns {
          tester {
            id
          }
        }
      }
    }
    me {
      ...MeFields
    }
    users {
      ...UserFields
    }
  }
`;

export const COLLECTION_JOB_UPDATES_QUERY = gql`
  ${COLLECTION_JOB_FIELDS}
  query CollectionJob($collectionJobId: ID!) {
    collectionJob(id: $collectionJobId) {
      ...CollectionJobFields
    }
  }
`;

export const TEST_RUN_PAGE_ANON_QUERY = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${TEST_FIELDS('all')}
  ${TEST_PLAN_REPORT_CONFLICT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  query TestPlanRunAnonPage($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
      id
      onHold
      isRerun
      conflicts {
        ...TestPlanReportConflictFields
      }
      at {
        ...AtFields
        atVersions {
          ...AtVersionFields
        }
      }
      browser {
        ...BrowserFields
        browserVersions {
          ...BrowserVersionFields
        }
      }
      testPlanVersion {
        ...TestPlanVersionFields
      }
      runnableTests {
        ...TestFieldsAll
        renderableContent
      }
    }
  }
`;

export const FIND_OR_CREATE_TEST_RESULT_MUTATION = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${EVENT_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${COLLECTION_JOB_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  ${TEST_FIELDS()}
  ${TEST_FIELDS('all')}
  ${TEST_PLAN_REPORT_CONFLICT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${USER_FIELDS}
  mutation FindOrCreateTestResult(
    $testPlanRunId: ID!
    $testId: ID!
    $atVersionId: ID!
    $browserVersionId: ID!
  ) {
    testPlanRun(id: $testPlanRunId) {
      findOrCreateTestResult(
        testId: $testId
        atVersionId: $atVersionId
        browserVersionId: $browserVersionId
      ) {
        locationOfData
        testPlanRun {
          id
          initiatedByAutomation
          collectionJob {
            ...CollectionJobFields
          }
          tester {
            ...UserFields
          }
          testResults {
            ...TestResultFields
            test {
              ...TestFieldsSimple
              renderableContent
            }
            scenarioResults {
              ...ScenarioResultFieldsAll
            }
            atVersion {
              ...AtVersionFields
            }
            browserVersion {
              ...BrowserVersionFields
            }
          }
          testPlanReport {
            id
            isRerun
            conflicts {
              ...TestPlanReportConflictFields
            }
            events {
              ...EventFields
            }
            at {
              ...AtFields
              atVersions {
                ...AtVersionFields
              }
            }
            minimumAtVersion {
              ...AtVersionFields
            }
            exactAtVersion {
              ...AtVersionFields
            }
            browser {
              ...BrowserFields
              browserVersions {
                ...BrowserVersionFields
              }
            }
            testPlanVersion {
              ...TestPlanVersionFields
            }
            runnableTests {
              ...TestFieldsAll
            }
          }
        }
      }
    }
  }
`;

export const SAVE_TEST_RESULT_MUTATION = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${EVENT_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${COLLECTION_JOB_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  ${TEST_FIELDS()}
  ${TEST_FIELDS('all')}
  ${TEST_PLAN_REPORT_CONFLICT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${USER_FIELDS}
  mutation SaveTestResult(
    $id: ID!
    $atVersionId: ID!
    $browserVersionId: ID!
    $scenarioResults: [ScenarioResultInput]!
  ) {
    testResult(id: $id) {
      saveTestResult(
        input: {
          id: $id
          atVersionId: $atVersionId
          browserVersionId: $browserVersionId
          scenarioResults: $scenarioResults
        }
      ) {
        locationOfData
        testPlanRun {
          id
          initiatedByAutomation
          collectionJob {
            ...CollectionJobFields
          }
          tester {
            ...UserFields
          }
          testResults {
            ...TestResultFields
            test {
              ...TestFieldsSimple
              renderableContent
            }
            scenarioResults {
              ...ScenarioResultFieldsAll
            }
            atVersion {
              ...AtVersionFields
            }
            browserVersion {
              ...BrowserVersionFields
            }
          }
          testPlanReport {
            id
            isRerun
            conflicts {
              ...TestPlanReportConflictFields
            }
            events {
              ...EventFields
            }
            at {
              ...AtFields
              atVersions {
                ...AtVersionFields
              }
            }
            minimumAtVersion {
              ...AtVersionFields
            }
            exactAtVersion {
              ...AtVersionFields
            }
            browser {
              ...BrowserFields
              browserVersions {
                ...BrowserVersionFields
              }
            }
            testPlanVersion {
              ...TestPlanVersionFields
            }
            runnableTests {
              ...TestFieldsAll
            }
          }
        }
      }
    }
  }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
  ${AT_FIELDS}
  ${AT_VERSION_FIELDS}
  ${EVENT_FIELDS}
  ${BROWSER_FIELDS}
  ${BROWSER_VERSION_FIELDS}
  ${COLLECTION_JOB_FIELDS}
  ${SCENARIO_RESULT_FIELDS('all')}
  ${TEST_FIELDS()}
  ${TEST_FIELDS('all')}
  ${TEST_PLAN_REPORT_CONFLICT_FIELDS}
  ${TEST_PLAN_VERSION_FIELDS}
  ${TEST_RESULT_FIELDS}
  ${USER_FIELDS}
  mutation SubmitTestResult(
    $id: ID!
    $atVersionId: ID!
    $browserVersionId: ID!
    $scenarioResults: [ScenarioResultInput]!
  ) {
    testResult(id: $id) {
      submitTestResult(
        input: {
          id: $id
          atVersionId: $atVersionId
          browserVersionId: $browserVersionId
          scenarioResults: $scenarioResults
        }
      ) {
        locationOfData
        testPlanRun {
          id
          initiatedByAutomation
          collectionJob {
            ...CollectionJobFields
          }
          tester {
            ...UserFields
          }
          testResults {
            ...TestResultFields
            test {
              ...TestFieldsSimple
              renderableContent
            }
            scenarioResults {
              ...ScenarioResultFieldsAll
            }
            atVersion {
              ...AtVersionFields
            }
            browserVersion {
              ...BrowserVersionFields
            }
          }
          testPlanReport {
            id
            isRerun
            conflicts {
              ...TestPlanReportConflictFields
            }
            events {
              ...EventFields
            }
            at {
              ...AtFields
              atVersions {
                ...AtVersionFields
              }
            }
            minimumAtVersion {
              ...AtVersionFields
            }
            exactAtVersion {
              ...AtVersionFields
            }
            browser {
              ...BrowserFields
              browserVersions {
                ...BrowserVersionFields
              }
            }
            testPlanVersion {
              ...TestPlanVersionFields
            }
            runnableTests {
              ...TestFieldsAll
            }
          }
        }
      }
    }
  }
`;

export const DELETE_TEST_RESULT_MUTATION = gql`
  mutation DeleteTestResult($id: ID!) {
    testResult(id: $id) {
      deleteTestResult {
        locationOfData
      }
    }
  }
`;

export const FIND_OR_CREATE_BROWSER_VERSION_MUTATION = gql`
  ${BROWSER_VERSION_FIELDS}
  mutation FindOrCreateBrowserVersion(
    $browserId: ID!
    $browserVersionName: String!
  ) {
    browser(id: $browserId) {
      findOrCreateBrowserVersion(input: { name: $browserVersionName }) {
        ...BrowserVersionFields
      }
    }
  }
`;
