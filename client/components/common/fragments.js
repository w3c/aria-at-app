import { gql } from '@apollo/client';

export const ME_FIELDS = gql`
  fragment ME_FIELDS on User {
    __typename
    id
    username
    roles
  }
`;

export const USER_FIELDS = gql`
  fragment USER_FIELDS on User {
    __typename
    id
    username
    roles
    isBot
  }
`;

export const AT_FIELDS = gql`
  fragment AT_FIELDS on At {
    __typename
    id
    key
    name
  }
`;

export const AT_VERSION_FIELDS = gql`
  fragment AT_VERSION_FIELDS on AtVersion {
    __typename
    id
    name
    releasedAt
  }
`;

export const BROWSER_FIELDS = gql`
  fragment BROWSER_FIELDS on Browser {
    __typename
    id
    key
    name
  }
`;

export const BROWSER_VERSION_FIELDS = gql`
  fragment BROWSER_VERSION_FIELDS on BrowserVersion {
    __typename
    id
    name
  }
`;

export const TEST_PLAN_FIELDS = gql`
  fragment TEST_PLAN_FIELDS on TestPlan {
    __typename
    id
    title
    directory
  }
`;

export const TEST_PLAN_VERSION_FIELDS = gql`
  fragment TEST_PLAN_VERSION_FIELDS on TestPlanVersion {
    __typename
    id
    title
    phase
    gitSha
    gitMessage
    versionString
    updatedAt
    draftPhaseReachedAt
    candidatePhaseReachedAt
    recommendedPhaseReachedAt
    recommendedPhaseTargetDate
    deprecatedAt
    metadata
    testPlan {
      directory
    }
  }
`;

export const TEST_PLAN_REPORT_FIELDS = gql`
  fragment TEST_PLAN_REPORT_FIELDS on TestPlanReport {
    __typename
    id
    runnableTestsLength
    conflictsLength
    vendorReviewStatus
    metrics
    createdAt
    markedFinalAt
    isFinal
  }
`;

export const TEST_PLAN_RUN_FIELDS = gql`
  fragment TEST_PLAN_RUN_FIELDS on TestPlanRun {
    __typename
    id
    testResultsLength
    initiatedByAutomation
    tester {
      id
      username
      isBot
    }
  }
`;

export const TEST_FIELDS = gql`
  fragment TEST_FIELDS on Test {
    __typename
    id
    title
    rowNumber
    testFormatVersion
  }
`;

export const TEST_RESULT_FIELDS = gql`
  fragment TEST_RESULT_FIELDS on TestResult {
    __typename
    id
    startedAt
    completedAt
  }
`;

export const SCENARIO_RESULT_FIELDS = gql`
  fragment SCENARIO_RESULT_FIELDS on ScenarioResult {
    __typename
  }
`;
