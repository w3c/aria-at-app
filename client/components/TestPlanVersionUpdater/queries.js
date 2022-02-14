import { gql } from '@apollo/client';

export const UPDATER_QUERY = gql`
query TestInfo {
    testPlanReport(id: 1) {
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
`

export const VERSION_QUERY = gql`
fragment TestFragment on Test {
    title
    ats {
      id
    }
    atMode
    scenarios (atId: 1) {
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
`