import { gql } from '@apollo/client';

const TEST_PLAN_REPORT_CONFLICT_FIELDS = gql`
  fragment TestPlanReportConflictFields on TestPlanReportConflict {
    __typename
    source {
      test {
        id
        title
        rowNumber
      }
      scenario {
        id
        commands {
          id
          text
          atOperatingMode
        }
      }
      assertion {
        id
        text
        phrase
        priority
      }
    }
    conflictingResults {
      testPlanRun {
        id
        initiatedByAutomation
        isRerun
        tester {
          id
          username
          isBot
        }
      }
      atVersion {
        name
      }
      browserVersion {
        name
      }
      test {
        id
        rowNumber
        title
        renderedUrl
      }
      scenario {
        commands {
          text
        }
      }
      scenarioResult {
        output
        untestable
        hasNegativeSideEffect
        negativeSideEffects {
          id
          text
          impact
          details
          encodedId
          atBugs {
            id
            title
            url
            at {
              id
              name
            }
          }
        }
        assertionResults {
          assertion {
            text
            priority
          }
          passed
        }
      }
      assertionResult {
        passed
      }
    }
  }
`;

export default TEST_PLAN_REPORT_CONFLICT_FIELDS;
