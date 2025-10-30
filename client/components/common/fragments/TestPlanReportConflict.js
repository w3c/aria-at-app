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
        tester {
          username
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
        }
      }
      assertionResult {
        passed
      }
    }
  }
`;

export default TEST_PLAN_REPORT_CONFLICT_FIELDS;
