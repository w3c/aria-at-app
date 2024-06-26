import { gql } from '@apollo/client';

export const TEST_RUN_PAGE_QUERY = gql`
  query TestPlanRunPage($testPlanRunId: ID!) {
    testPlanRun(id: $testPlanRunId) {
      id
      initiatedByAutomation
      collectionJob {
        id
        status
        externalLogsUrl
        testStatus {
          test {
            id
          }
          status
        }
      }
      tester {
        id
        username
        isBot
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
              phrase
            }
            passed
          }
          mustAssertionResults: assertionResults(priority: MUST) {
            assertion {
              text
              phrase
            }
            passed
          }
          shouldAssertionResults: assertionResults(priority: SHOULD) {
            assertion {
              text
              phrase
            }
            passed
          }
          mayAssertionResults: assertionResults(priority: MAY) {
            assertion {
              text
              phrase
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
              phrase
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
            releasedAt
          }
        }
        minimumAtVersion {
          id
          name
          releasedAt
        }
        exactAtVersion {
          id
          name
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
    }
    me {
      id
      username
      roles
    }
    users {
      id
      username
      isBot
    }
  }
`;

export const COLLECTION_JOB_UPDATES_QUERY = gql`
  query CollectionJob($collectionJobId: ID!) {
    collectionJob(id: $collectionJobId) {
      id
      status
      externalLogsUrl
      testStatus {
        test {
          id
        }
        status
      }
    }
  }
`;

export const TEST_RUN_PAGE_ANON_QUERY = gql`
  query TestPlanRunAnonPage($testPlanReportId: ID!) {
    testPlanReport(id: $testPlanReportId) {
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
            phrase
          }
        }
        conflictingResults {
          testPlanRun {
            id
            tester {
              username
              isBot
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
        renderableContent
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
  }
`;

export const FIND_OR_CREATE_TEST_RESULT_MUTATION = gql`
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
          tester {
            id
            username
            isBot
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
                  phrase
                }
                passed
              }
              mustAssertionResults: assertionResults(priority: MUST) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              shouldAssertionResults: assertionResults(priority: SHOULD) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              mayAssertionResults: assertionResults(priority: MAY) {
                assertion {
                  text
                  phrase
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
                  phrase
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
                releasedAt
              }
            }
            minimumAtVersion {
              id
              name
              releasedAt
            }
            exactAtVersion {
              id
              name
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
        }
        testPlanReport {
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
                phrase
              }
            }
            conflictingResults {
              testPlanRun {
                id
                tester {
                  isBot
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
              releasedAt
            }
          }
          minimumAtVersion {
            id
            name
            releasedAt
          }
          exactAtVersion {
            id
            name
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
      }
    }
  }
`;

export const SAVE_TEST_RESULT_MUTATION = gql`
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
          tester {
            id
            username
            isBot
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
                  phrase
                }
                passed
              }
              mustAssertionResults: assertionResults(priority: MUST) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              shouldAssertionResults: assertionResults(priority: SHOULD) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              mayAssertionResults: assertionResults(priority: MAY) {
                assertion {
                  text
                  phrase
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
                  phrase
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
                releasedAt
              }
            }
            minimumAtVersion {
              id
              name
              releasedAt
            }
            exactAtVersion {
              id
              name
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
        }
        testPlanReport {
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
                phrase
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
              releasedAt
            }
          }
          minimumAtVersion {
            id
            name
            releasedAt
          }
          exactAtVersion {
            id
            name
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
      }
    }
  }
`;

export const SUBMIT_TEST_RESULT_MUTATION = gql`
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
                  phrase
                }
                passed
              }
              mustAssertionResults: assertionResults(priority: MUST) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              shouldAssertionResults: assertionResults(priority: SHOULD) {
                assertion {
                  text
                  phrase
                }
                passed
              }
              mayAssertionResults: assertionResults(priority: MAY) {
                assertion {
                  text
                  phrase
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
                  phrase
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
                releasedAt
              }
            }
            minimumAtVersion {
              id
              name
              releasedAt
            }
            exactAtVersion {
              id
              name
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
        }
        testPlanReport {
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
                phrase
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
              releasedAt
            }
          }
          minimumAtVersion {
            id
            name
            releasedAt
          }
          exactAtVersion {
            id
            name
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
  mutation FindOrCreateBrowserVersion(
    $browserId: ID!
    $browserVersionName: String!
  ) {
    browser(id: $browserId) {
      findOrCreateBrowserVersion(input: { name: $browserVersionName }) {
        id
        name
      }
    }
  }
`;
